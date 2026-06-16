"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { extractReceiptDataDetailed, parseBankStatementWithAI } from "@/lib/services/ai-reconciliation";
import { revalidatePath } from "next/cache";
import { revalidateFormSubmissions } from "@/lib/actions/cache";
import { verifyPermission, verifySuperAdmin } from "@/lib/auth/guards";
import { uploadReceipt } from "@/lib/actions";
import {
  INVALID_RECEIPT_MESSAGE,
  UNRECOGNIZED_DESTINATION_ACCOUNT_MESSAGE,
  classifyFinancialReceipt,
  resolveFinancialReceiptValidation,
} from "@/lib/services/receipt-validation";
import { normalizeFormKey } from "@/lib/form-response-history";
import { findNameInSubmission } from "@/lib/form-utils";
import {
  buildManualPricingSnapshot,
  validateManualFinancialForm,
  validateManualRegistrationValues,
} from "@/lib/finance/manual-registration.mjs";
import { applyManualPaymentToSubmission } from "@/lib/finance/manual-payment.mjs";
import { buildActiveReconciledTransactionIds } from "@/lib/finance/submission-lifecycle.mjs";
import { getSubmissionPaymentSummary } from "@/lib/finance/payment-summary.mjs";

function buildDiscardedItems(submissions: any[] = []) {
  return submissions.flatMap((submission) =>
    (submission.form_submission_payments || [])
      .filter((payment: any) => payment?.manual_disposition)
      .map((payment: any) => ({
        ...payment,
        submissionId: submission.id,
        submissionName:
          submission.profiles?.full_name ||
          findNameInSubmission(submission) ||
          submission.notification_email ||
          "Sin nombre",
        discardReason: payment.manual_disposition,
        coveredBySubmissionId: submission.covered_by_submission_id || null,
      })),
  );
}

async function ensurePaymentGroupForDuplicate(admin: any, {
  formId,
  primarySubmissionId,
  currentSubmissionId,
  primaryPaymentId,
}: {
  formId: string;
  primarySubmissionId: string;
  currentSubmissionId: string;
  primaryPaymentId?: string | null;
}) {
  const { data: primarySubmission } = await admin
    .from("form_submissions")
    .select("payment_group_id, expected_amount")
    .eq("id", primarySubmissionId)
    .maybeSingle();

  let paymentGroupId = primarySubmission?.payment_group_id || null;
  const initialExpectedAmount = Math.abs(Number(primarySubmission?.expected_amount || 0));

  if (!paymentGroupId) {
    const { data: group, error: groupError } = await admin
      .from("payment_groups")
      .insert([{
        form_id: formId,
        created_by_submission_id: primarySubmissionId,
        expected_amount: initialExpectedAmount,
        calculated_expected_amount: initialExpectedAmount,
        expected_amount_source: "calculated",
      }])
      .select("id")
      .single();

    if (groupError) throw groupError;
    paymentGroupId = group.id;
  }

  await admin
    .from("form_submissions")
    .update({ payment_group_id: paymentGroupId })
    .in("id", [primarySubmissionId, currentSubmissionId]);

  if (primaryPaymentId) {
    await admin
      .from("form_submission_payments")
      .update({ payment_group_id: paymentGroupId })
      .eq("id", primaryPaymentId)
      .is("payment_group_id", null);
  }

  await recalculatePaymentGroupExpectedAmount(admin, paymentGroupId);

  return paymentGroupId;
}

async function recalculatePaymentGroupExpectedAmount(admin: any, paymentGroupId: string) {
  if (!paymentGroupId) return null;

  const { data: group } = await admin
    .from("payment_groups")
    .select("id, expected_amount_source")
    .eq("id", paymentGroupId)
    .maybeSingle();

  if (!group) return null;

  const { data: submissions } = await admin
    .from("form_submissions")
    .select("id, expected_amount, is_archived, submission_status")
    .eq("payment_group_id", paymentGroupId);

  const calculated = (submissions || [])
    .filter((submission: any) => !submission.is_archived && submission.submission_status !== "cancelled")
    .reduce((sum: number, submission: any) => sum + Math.abs(Number(submission.expected_amount || 0)), 0);

  const update: Record<string, any> = { calculated_expected_amount: calculated };
  if (group.expected_amount_source !== "manual") {
    update.expected_amount = calculated;
    update.expected_amount_source = "calculated";
  }

  await admin.from("payment_groups").update(update).eq("id", paymentGroupId);
  return calculated;
}

/**
 * Step 1: Initialize a bank report
 */
export async function initBankReport(
  filename: string,
  bankAccount?: { id?: string | null; bank_name?: string | null; account_number?: string | null } | null,
): Promise<{ reportId?: string, error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const labelParts = [bankAccount?.bank_name, bankAccount?.account_number].filter(Boolean);
    const reportLabel = labelParts.length > 0 ? `${labelParts.join(" - ")} · ${filename}` : filename;
    const basePayload: Record<string, any> = {
      filename: reportLabel,
      created_by: user?.id,
    };

    const payloads = bankAccount?.id
      ? [
          { ...basePayload, bank_account_id: bankAccount.id },
          { ...basePayload, account_id: bankAccount.id },
          basePayload,
        ]
      : [basePayload];

    let lastErr: any = null;
    for (const payload of payloads) {
      const { data: report, error: reportErr } = await supabase
        .from("bank_reports")
        .insert([payload])
        .select()
        .single();

      if (!reportErr && report) {
        return { reportId: report.id };
      }
      lastErr = reportErr;
      const message = String(reportErr?.message || "").toLowerCase();
      if (!message.includes("column") && !message.includes("does not exist") && !message.includes("unknown")) {
        break;
      }
    }

    if (lastErr) throw lastErr;
    throw new Error("No se pudo crear el reporte bancario");
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Step 2: Process a chunk of data rows
 */
export async function processBankChunk(
  reportId: string,
  chunk: any[][],
  headers: any[],
  bankAccount?: { bank_name?: string | null; account_number?: string | null } | null,
): Promise<{ success: boolean, error?: string }> {
  try {
    const supabase = await createClient();
    const extracted = await parseBankStatementWithAI(chunk, headers, bankAccount
      ? {
          bankAccountName: bankAccount.bank_name || undefined,
          bankAccountNumber: bankAccount.account_number || undefined,
        }
      : undefined);

    if (!extracted || extracted.length === 0) return { success: true };

    const dbTransactions = extracted.map(t => ({
      report_id: reportId,
      date: t.date,
      amount: t.amount,
      description: t.description || (t.sender_name 
        ? `Depósito - ${t.sender_name}` 
        : 'Depósito'),
      reference: String(t.reference || "").trim(),
      bank_name: t.bank_name || bankAccount?.bank_name || "Desconocido"
    }));

    const { error: batchErr } = await supabase.from("bank_transactions").upsert(dbTransactions, { 
      onConflict: 'date, amount, description, reference',
      ignoreDuplicates: true 
    });

    if (batchErr) console.warn("[Finance] Chunk Dedup warning:", batchErr.message);
    return { success: true };
  } catch (e: any) {
    console.error("Error processing bank chunk:", e);
    return { success: false, error: e.message };
  }
}

/**
 * Step 3: Finalize report and refresh cache
 */
export async function finalizeBankReport() {
  revalidatePath("/admin/finanzas");
  return { success: true };
}

/**
 * DEPRECATED: Use the chunked methods above for better UX
 */
export async function parseBankReport(formData: FormData): Promise<{ reportId?: string, error?: string }> {
  // Keep original for backward compatibility if needed, but we will use the new ones
  const file = formData.get("file") as File;
  if (!file) return { error: "No se proporcionó archivo" };
  // ... rest of original implementation ...
  return { error: "Action deprecated. Use chunked processing." };
}

/**
 * Gets the entire church-wide bank pool, enhanced with global conciliation status.
 * If a bank account is provided, only transactions from reports tied to that account are returned.
 */
export async function getGlobalTransactions(selectedBankAccountId?: string | null) {
  const supabase = await createClient();

  let transactionsQuery = supabase
    .from("bank_transactions")
    .select("*")
    .order("date", { ascending: false });

  if (selectedBankAccountId) {
    const reportIds = new Set<string>();
    const accountColumns = ["bank_account_id", "account_id"];

    for (const column of accountColumns) {
      const { data: reports, error } = await supabase
        .from("bank_reports")
        .select("id")
        .eq(column, selectedBankAccountId);

      if (!error) {
        (reports || []).forEach((report: any) => reportIds.add(report.id));
        if (reportIds.size > 0 || column === accountColumns[accountColumns.length - 1]) {
          break;
        }
        continue;
      }

      const message = String(error.message || "").toLowerCase();
      if (!message.includes("column") && !message.includes("does not exist") && !message.includes("unknown")) {
        return { error: error.message };
      }
    }

    if (reportIds.size === 0) {
      return { transactions: [] };
    }

    transactionsQuery = supabase
      .from("bank_transactions")
      .select("*")
      .in("report_id", Array.from(reportIds))
      .order("date", { ascending: false });
  }

  const { data: transactions, error: txError } = await transactionsQuery;

  if (txError) return { error: txError.message };

  const reportAccountById = new Map<string, string>();
  const transactionReportIds = Array.from(new Set((transactions || []).map((tx: any) => tx.report_id).filter(Boolean)));

  if (transactionReportIds.length > 0) {
    const accountColumns = ["bank_account_id", "account_id"];
    for (const column of accountColumns) {
      const { data: reports, error } = await supabase
        .from("bank_reports")
        .select(`id, ${column}`)
        .in("id", transactionReportIds);

      if (!error) {
        (reports || []).forEach((report: any) => {
          if (report?.id && report?.[column]) {
            reportAccountById.set(report.id, report[column]);
          }
        });
        continue;
      }

      const message = String(error.message || "").toLowerCase();
      if (!message.includes("column") && !message.includes("does not exist") && !message.includes("unknown")) {
        return { error: error.message };
      }
    }
  }

  // 2. Get reconciled IDs only from active submissions. Archived responses stay restorable,
  // but they must not occupy bank movements while they are in the recycle bin.
  const { data: reconciled, error: recError } = await supabase
    .from("form_submission_payments")
    .select("bank_transaction_id, form_submissions!inner(is_archived)")
    .not("bank_transaction_id", "is", null);

  if (recError) return { error: recError.message };

  const reconciledIds = buildActiveReconciledTransactionIds(reconciled || []);

  const enhancedTransactions = transactions.map(tx => ({
    ...tx,
    bank_account_id: reportAccountById.get(tx.report_id) || tx.bank_account_id || tx.account_id || null,
    is_reconciled: reconciledIds.has(tx.id)
  }));

  return { transactions: enhancedTransactions };
}

/**
 * Analyzes receipts and updates status for a specific form.
 */
export async function analyzeFormReceipts(formId: string) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  try {
    const { data: form } = await supabase
      .from("forms")
      .select("financial_field_label, financial_field_id, form_fields!form_id(id, label)")
      .eq("id", formId)
      .single();

    if (!form?.financial_field_id && !form?.financial_field_label) throw new Error("Formulario no configurado");

    const { data: submissions, error: subError } = await supabase
      .from("form_submissions")
      .select("*, profiles:profiles!form_submissions_user_id_fkey(full_name, email), payment_groups!form_submissions_payment_group_id_fkey(id, expected_amount, calculated_expected_amount, expected_amount_source), form_submission_payments(id, receipt_path, extracted_data, status, bank_transaction_id, created_at, manual_disposition, manual_disposition_at, manual_disposition_by, manual_disposition_notes, payment_group_id)")
      .eq("form_id", formId)
      .eq("is_archived", false);

    if (subError) throw subError;

    for (const sub of submissions) {
      const financialField = (form as any).form_fields?.find((f: any) => f.id === (form as any).financial_field_id);
      const targetLabel = (financialField?.label ?? form.financial_field_label ?? "").trim();
      const submissionAnswers = Array.isArray((sub as any).answers) ? (sub as any).answers : [];
      const answerById = financialField?.id
        ? submissionAnswers.find((answer: any) => answer?.field_id === financialField.id)
        : undefined;
      const answerByLabel = targetLabel
        ? submissionAnswers.find(
            (answer: any) =>
              normalizeFormKey(answer?.label || answer?.key) === normalizeFormKey(targetLabel),
          )
        : undefined;
      const financialAnswer = answerById || answerByLabel;
      const answerValue = financialAnswer?.value;
      const answerPath = answerValue && typeof answerValue === "object"
        ? answerValue.financial_receipt_path || answerValue.path || null
        : null;
      const actualKey = targetLabel
        ? Object.keys(sub.data || {}).find(k => k.trim().toLowerCase() === targetLabel.toLowerCase())
        : undefined;
      const legacyPath = actualKey ? sub.data[actualKey]?.financial_receipt_path : null;
      const mainPath = answerPath || legacyPath;

      // Unificar rutas para procesar (evitar duplicados si mainPath también está en form_submission_payments)
      const pathsToProcess = new Set<string>();
      if (mainPath && !mainPath.includes('..')) {
         pathsToProcess.add(mainPath);
      }
      
      const paymentRecords = Array.isArray(sub.form_submission_payments) ? sub.form_submission_payments : [];
      paymentRecords.forEach(p => {
          if (p.receipt_path && !p.receipt_path.includes('..')) {
              pathsToProcess.add(p.receipt_path);
          }
      });

      for (const path of Array.from(pathsToProcess)) {
          // Revisar si ya existe un registro de pago y si ya fue procesado por la IA
          const existingPayment = paymentRecords.find(p => p.receipt_path === path);
          
          let aiData = existingPayment?.extracted_data;
          
          // Si el recibo principal coincide con sub.financial_data y aún no hay existingPayment con datos
          if (path === mainPath && !aiData && sub.financial_data && Object.keys(sub.financial_data).length > 0) {
              aiData = sub.financial_data;
          }

          // Si no hay datos extraídos o están vacíos, mandamos a procesar la imagen
          if (!aiData || Object.keys(aiData).length === 0) {
              console.log(`[analyzeFormReceipts] Iniciando proceso de IA para: ${path}`);
              const { data: fileBlob, error: dlErr } = await supabaseAdmin.storage
                .from("finance_receipts")
                .download(path.replace('finance_receipts/', ''));

              if (dlErr) {
                  console.error(`[analyzeFormReceipts] Error al descargar ${path}:`, dlErr);
              }

              if (!dlErr && fileBlob) {
                  try {
                      const buffer = await fileBlob.arrayBuffer();
                      const extraction = await extractReceiptDataDetailed(Buffer.from(buffer).toString('base64'), fileBlob.type);
                      aiData = extraction.data;
                      console.log(`[analyzeFormReceipts] IA procesó correctamente: ${path}`);
                  } catch (e) {
                      console.error(`[analyzeFormReceipts] Error en extractReceiptData para ${path}:`, e);
                      // Fallback: leave it as is if AI fails, but try to create the row
                  }
              }
          }

          // Solo insertamos/actualizamos si logramos obtener aiData (ya sea de DB o recién procesado)
          // O si es la primera vez que vemos este path y queremos dejar un registro 'pending'
          if (aiData && Object.keys(aiData).length > 0) {
               const payload = {
                  submission_id: sub.id,
                  receipt_path: path,
                  extracted_data: aiData,
                  status: existingPayment?.status || (aiData.is_valid_receipt ? 'pending' : 'manual_review'),
               };

               let dbErr;
               if (existingPayment?.id) {
                   const { error } = await supabaseAdmin.from("form_submission_payments").update(payload).eq("id", existingPayment.id);
                   dbErr = error;
               } else {
                   const { error } = await supabaseAdmin.from("form_submission_payments").insert([payload]);
                   dbErr = error;
               }
                
               if (dbErr) {
                   console.error(`[analyzeFormReceipts] DB Error guardando AI para ${path}:`, dbErr.message);
               }
          } else if (!existingPayment) {
               // Crear el registro aunque la IA haya fallado para no perderlo
               const { error: dbErr2 } = await supabaseAdmin
                .from("form_submission_payments")
                .insert([{
                  submission_id: sub.id,
                  receipt_path: path,
                  extracted_data: null,
                  status: 'manual_review',
                }]);
                
               if (dbErr2) {
                   console.error(`[analyzeFormReceipts] DB Error creando registro vacío para ${path}:`, dbErr2.message);
               }
          }
      }
    }

    const { data: updated } = await supabase
      .from("form_submissions")
      .select("*, profiles:profiles!form_submissions_user_id_fkey(full_name, email), payment_groups!form_submissions_payment_group_id_fkey(id, expected_amount, calculated_expected_amount, expected_amount_source), form_submission_payments(*)")
      .eq("form_id", formId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    await revalidateFormSubmissions(formId);
    return { success: true, submissions: updated, discardedItems: buildDiscardedItems(updated || []) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function discardPaymentReceipt(payload: {
  paymentId: string;
  reason: "incorrecto" | "duplicado";
  notes?: string;
  coveredBySubmissionId?: string | null;
}) {
  await verifyPermission("perm_finanzas");

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data: payment, error } = await admin
      .from("form_submission_payments")
      .select("id, submission_id, status, manual_disposition, payment_group_id")
      .eq("id", payload.paymentId)
      .single();

    if (error || !payment) return { error: "No se encontró el comprobante." };
    if (payment.status === "verified") return { error: "No se puede descartar un comprobante ya conciliado." };
    if (payload.reason === "duplicado" && !payload.coveredBySubmissionId) {
      return { error: "Debes seleccionar la inscripción principal." };
    }

    let duplicatePaymentGroupId = null;
    let primaryPaymentId = null;

    if (payload.reason === "duplicado") {
      const { data: primarySubmission, error: primaryErr } = await admin
        .from("form_submissions")
        .select("id, form_id, payment_group_id, form_submission_payments(id, status, manual_disposition, payment_group_id)")
        .eq("id", payload.coveredBySubmissionId)
        .single();

      const { data: currentSubmission, error: currentErr } = await admin
        .from("form_submissions")
        .select("id, form_id, payment_group_id")
        .eq("id", payment.submission_id)
        .single();

      if (primaryErr || !primarySubmission || currentErr || !currentSubmission) {
        return { error: "No se pudo validar la inscripción principal." };
      }
      if (primarySubmission.id === currentSubmission.id) {
        return { error: "La inscripción principal no puede ser la misma inscripción descartada." };
      }
      if (primarySubmission.form_id !== currentSubmission.form_id) {
        return { error: "La inscripción principal debe pertenecer al mismo formulario." };
      }

      const activePayment = (primarySubmission.form_submission_payments || []).find(
        (candidate: any) =>
          ["pending", "verified"].includes(candidate?.status) && !candidate?.manual_disposition,
      );
      if (!activePayment) {
        return { error: "La inscripción principal debe tener un pago activo y utilizable." };
      }
      primaryPaymentId = activePayment.id;
      duplicatePaymentGroupId = await ensurePaymentGroupForDuplicate(admin, {
        formId: currentSubmission.form_id,
        primarySubmissionId: primarySubmission.id,
        currentSubmissionId: currentSubmission.id,
        primaryPaymentId,
      });
    }

    const paymentUpdate: Record<string, any> = {
      manual_disposition: payload.reason,
      manual_disposition_at: new Date().toISOString(),
      manual_disposition_by: user?.id || null,
      manual_disposition_notes: payload.notes || null,
      bank_transaction_id: null,
    };

    if (payload.reason === "duplicado") {
      paymentUpdate.payment_group_id = duplicatePaymentGroupId;
    }

    const submissionUpdate =
      payload.reason === "incorrecto"
        ? {
            coverage_mode: "bank_receipt",
            covered_by_submission_id: null,
          }
        : {
            coverage_mode: "covered_by_used_payment",
            covered_by_submission_id: payload.coveredBySubmissionId,
            payment_group_id: duplicatePaymentGroupId,
          };

    const { data: submission, error: submissionErr } = await admin
      .from("form_submissions")
      .select("form_id")
      .eq("id", payment.submission_id)
      .single();

    if (submissionErr) throw submissionErr;

    const { error: payUpdateErr } = await admin
      .from("form_submission_payments")
      .update(paymentUpdate)
      .eq("id", payload.paymentId);

    if (payUpdateErr) throw payUpdateErr;

    const { error: subUpdateErr } = await admin
      .from("form_submissions")
      .update(submissionUpdate)
      .eq("id", payment.submission_id);

    if (subUpdateErr) throw subUpdateErr;

    await revalidateFormSubmissions(submission.form_id);
    revalidatePath("/admin/finanzas");
    revalidatePath("/admin/formularios/inscripciones");
    return { success: true };
  } catch (err: any) {
    console.error("Error en discardPaymentReceipt:", err);
    return { error: err.message || "No se pudo descartar el comprobante." };
  }
}

/**
 * Concilia un abono específico con una transacción bancaria.
 */
export async function reconcilePayment(paymentId: string, transactionId: string, notes?: string) {
  const supabase = await createClient();
  
  try {
    const { data: currentPayment, error: currentPaymentErr } = await supabase
      .from("form_submission_payments")
      .select("submission_id")
      .eq("id", paymentId)
      .single();

    if (currentPaymentErr) throw currentPaymentErr;

    const { data: submission, error: submissionErr } = await supabase
      .from("form_submissions")
      .select("form_id")
      .eq("id", currentPayment.submission_id)
      .single();

    if (submissionErr) throw submissionErr;

    // 1. Actualizar el abono
    const { error: payErr } = await supabase
      .from("form_submission_payments")
      .update({
        bank_transaction_id: transactionId,
        status: 'verified',
        reconciliation_notes: notes || `Conciliado manualmente el ${new Date().toISOString()}`
      })
      .eq("id", paymentId)
      .select("submission_id")
      .single();

    if (payErr) throw payErr;

    // 2. Verificar si todos los abonos de esta inscripción están verificados
    // (Opcional: podrías querer cambiar el status global de la inscripción a 'verified'
    // si consideras que ya se completó el pago, pero por ahora lo dejamos granular)
    await revalidateFormSubmissions(submission.form_id);
    revalidatePath("/admin/finanzas");
    return { success: true };
  } catch (error: any) {
    console.error("Error en reconcilePayment:", error);
    return { error: error.message };
  }
}

/**
 * Super-admin/manual review: update extracted receipt data before reconciliation.
 */
export async function updatePaymentReview(
  paymentId: string,
  payload: {
    extractedData?: Record<string, any>;
    amountClaimed?: number | null;
    status?: "pending" | "manual_review";
    notes?: string | null;
  },
) {
  await verifyPermission("perm_finanzas");

  const supabase = createAdminClient();

  try {
    const { data: currentPayment, error: fetchErr } = await supabase
      .from("form_submission_payments")
      .select("id, submission_id, extracted_data, amount_claimed, status, reconciliation_notes, manual_disposition, payment_group_id")
      .eq("id", paymentId)
      .single();

    if (fetchErr) throw fetchErr;
    if (!currentPayment) throw new Error("Pago no encontrado");

    const { data: submission, error: submissionErr } = await supabase
      .from("form_submissions")
      .select("form_id")
      .eq("id", currentPayment.submission_id)
      .single();

    if (submissionErr) throw submissionErr;

    const mergedExtractedData = {
      ...(currentPayment.extracted_data || {}),
      ...(payload.extractedData || {}),
    };

    const restoresDiscardedPayment = !!currentPayment.manual_disposition;
    const paymentUpdate: Record<string, any> = {
      extracted_data: mergedExtractedData,
      amount_claimed:
        payload.amountClaimed !== undefined && payload.amountClaimed !== null
          ? payload.amountClaimed
          : currentPayment.amount_claimed,
      status: payload.status || currentPayment.status || "manual_review",
      reconciliation_notes:
        payload.notes !== undefined ? payload.notes : currentPayment.reconciliation_notes,
    };

    if (restoresDiscardedPayment) {
      Object.assign(paymentUpdate, {
        manual_disposition: null,
        manual_disposition_at: null,
        manual_disposition_by: null,
        manual_disposition_notes: null,
        bank_transaction_id: null,
        payment_group_id: null,
      });
    }

    const { error: updateErr } = await supabase
      .from("form_submission_payments")
      .update(paymentUpdate)
      .eq("id", paymentId);

    if (updateErr) throw updateErr;

    if (restoresDiscardedPayment) {
      const { error: submissionRestoreErr } = await supabase
        .from("form_submissions")
        .update({
          coverage_mode: "bank_receipt",
          covered_by_submission_id: null,
          payment_group_id: null,
        })
        .eq("id", currentPayment.submission_id);

      if (submissionRestoreErr) throw submissionRestoreErr;
    }

    await revalidateFormSubmissions(submission.form_id);
    revalidatePath("/admin/finanzas");
    return { success: true };
  } catch (error: any) {
    console.error("Error en updatePaymentReview:", error);
    return { error: error.message || "Error al actualizar la revisión" };
  }
}

/**
 * Validates a payment by linking it to a bank transaction.
 */
export async function updateFinancialStatus(submissionId: string, status: string, notes?: string, matchId?: string) {
  const supabase = await createClient();
  const updateData: any = { financial_status: status, reconciliation_notes: notes };
  if (matchId) updateData.bank_transaction_id = matchId;

  const { error } = await supabase.from("form_submissions").update(updateData).eq("id", submissionId);
  revalidatePath("/admin/finanzas");
  return error ? { error: error.message } : { success: true };
}

export async function createManualFinancialRegistration(payload: {
  formId: string;
  data: Record<string, any>;
  answers: any[];
  rawValues?: Record<string, any>;
  coverageMode: "cash" | "card" | "scholarship";
  coverageAmount?: number | null;
  backupImagePath?: string | null;
  notificationEmail?: string | null;
}) {
  await verifyPermission("perm_forms");

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    if ((payload.coverageMode === "cash" || payload.coverageMode === "card") && !payload.coverageAmount) {
      return { error: "El monto es obligatorio para efectivo y tarjeta." };
    }

    const { data: form, error: formError } = await admin
      .from("forms")
      .select("id, is_financial, is_archived, financial_field_id, financial_field_label, total_amount, pricing_mode, pricing_packages, pricing_field_id, form_fields!form_id(id, label, type, required, options, order_index)")
      .eq("id", payload.formId)
      .maybeSingle();

    if (formError) {
      return { error: formError.message };
    }

    const formValidation = validateManualFinancialForm(form);
    if (!formValidation.valid) {
      return { error: formValidation.error };
    }

    const fieldValidation = validateManualRegistrationValues(
      (form as any)?.form_fields || [],
      payload.rawValues || {},
    );
    if (!fieldValidation.valid) {
      return {
        error: `Completa los campos requeridos: ${fieldValidation.missingFieldLabels.join(", ")}`,
      };
    }

    const submissionValues = applyManualPaymentToSubmission({
      form,
      data: payload.data,
      answers: payload.answers,
      coverageMode: payload.coverageMode,
      coverageAmount: payload.coverageAmount,
    });
    const manualPricing = buildManualPricingSnapshot(form, payload.rawValues || {});

    const submissionPayload = {
      form_id: payload.formId,
      data: submissionValues.data,
      answers: submissionValues.answers,
      expected_amount: manualPricing.expected_amount,
      pricing_snapshot: manualPricing.pricingSnapshot,
      notification_email: payload.notificationEmail || null,
      user_agent: "admin-manual-registration",
      is_manual: true,
      coverage_mode: payload.coverageMode,
      coverage_amount: payload.coverageMode === "scholarship" ? null : payload.coverageAmount,
      coverage_backup_path: payload.backupImagePath || null,
      coverage_created_at: new Date().toISOString(),
      coverage_created_by: user?.id || null,
      is_archived: false,
    };

    const { data, error } = await admin
      .from("form_submissions")
      .insert([submissionPayload])
      .select()
      .single();

    if (error) return { error: error.message };

    await revalidateFormSubmissions(payload.formId);
    revalidatePath("/admin/formularios/inscripciones");
    revalidatePath("/admin/finanzas");
    if (data?.access_token) {
      revalidatePath(`/inscripcion/${data.access_token}`);
    }
    return { success: true, submission: data };
  } catch (error: any) {
    console.error("Error en createManualFinancialRegistration:", error);
    return { error: error.message || "No se pudo crear la inscripción manual." };
  }
}

/**
 * Gets a summary of all events with financial forms for the dashboard.
 */
export async function getFinancialSummary() {
  const supabase = await createClient();

  try {
    const { data: events, error: eventsErr } = await supabase
      .from("events")
      .select(`
        id, 
        title, 
        start_time,
        forms!inner (
          id,
          title,
          is_financial
        )
      `)
      .eq("forms.is_financial", true)
      .eq("is_archived", false)
      .order("start_time", { ascending: true });

    if (eventsErr) throw eventsErr;

    const summary = [];

    for (const event of events) {
      const form = Array.isArray(event.forms) ? event.forms[0] : event.forms;
      if (!form) continue;

      // Fetch submissions with their associated payments
      const { data: submissions, error: subErr } = await supabase
        .from("form_submissions")
        .select(`
          id,
          form_submission_payments (
            amount_claimed,
            extracted_data,
            status,
            manual_disposition
          )
        `)
        .eq("form_id", form.id)
        .eq("is_archived", false);

      if (subErr) continue;

      const totalInscribed = submissions.length;
      const verifiedAmount = submissions.reduce((acc, submission) => {
        const payments = submission.form_submission_payments || [];
        return acc + payments
          .filter(p => p.status === 'verified' && !p.manual_disposition)
          .reduce((paymentAcc, p) => paymentAcc + Number(p.extracted_data?.amount || p.amount_claimed || 0), 0);
      }, 0);

      summary.push({
        eventId: event.id,
        eventTitle: event.title,
        startTime: event.start_time,
        formId: form.id,
        totalInscribed,
        verifiedAmount
      });
    }

    return { summary };
  } catch (e: any) {
    console.error("Error fetching financial summary:", e);
    return { error: e.message };
  }
}

/**
 * Gets temporary URL for visual audit.
 */
export async function getReceiptSignedUrl(fullPath: string) {
  await verifyPermission("perm_finanzas");
  if (fullPath.includes('..')) return { error: "Ruta inválida" };
  const supabase = createAdminClient();
  const path = fullPath.replace('finance_receipts/', '');
  const { data, error } = await supabase.storage.from("finance_receipts").createSignedUrl(path, 600);
  return error ? { error: error.message } : { url: data.signedUrl };
}

export async function getTrackingReceiptSignedUrl(payload: {
  submissionId: string;
  accessToken: string;
  receiptPath: string;
}) {
  const { submissionId, accessToken, receiptPath } = payload;

  if (!submissionId || !accessToken || !receiptPath) {
    return { error: "Datos incompletos para consultar el comprobante." };
  }

  if (receiptPath.includes("..")) {
    return { error: "Ruta inválida" };
  }

  const supabase = createAdminClient();
  const { data: submission, error } = await supabase
    .from("form_submissions")
    .select("id, coverage_backup_path, payment_group_id, form_submission_payments(receipt_path)")
    .eq("id", submissionId)
    .eq("access_token", accessToken)
    .eq("is_archived", false)
    .single();

  if (error || !submission) {
    return { error: "No pudimos validar tu enlace de seguimiento." };
  }

  const authorizedPaths = new Set<string>();
  const addAuthorizedPath = (path?: string | null) => {
    if (!path) return;
    authorizedPaths.add(path);
    authorizedPaths.add(path.replace("finance_receipts/", ""));
  };

  addAuthorizedPath((submission as any).coverage_backup_path);
  ((submission as any).form_submission_payments || []).forEach((payment: any) => {
    addAuthorizedPath(payment?.receipt_path);
  });

  if ((submission as any).payment_group_id) {
    const { data: groupPayments } = await supabase
      .from("form_submission_payments")
      .select("receipt_path")
      .eq("payment_group_id", (submission as any).payment_group_id);

    (groupPayments || []).forEach((payment: any) => {
      addAuthorizedPath(payment?.receipt_path);
    });
  }

  if (!authorizedPaths.has(receiptPath) && !authorizedPaths.has(receiptPath.replace("finance_receipts/", ""))) {
    return { error: "No tienes acceso a este comprobante." };
  }

  const path = receiptPath.replace("finance_receipts/", "");
  const { data, error: signError } = await supabase.storage
    .from("finance_receipts")
    .createSignedUrl(path, 600);

  return signError ? { error: signError.message } : { url: data.signedUrl };
}

/**
 * Agrega un nuevo abono (pago parcial) a una inscripción existente.
 * Verificado mediante access_token para seguridad de usuarios anónimos.
 */
export async function addMultipartPayment(payload: {
  submissionId: string;
  accessToken: string;
  receiptPath: string;
  amountClaimed?: number;
}) {
  const { submissionId, accessToken, receiptPath, amountClaimed } = payload;
  const supabaseAdmin = createAdminClient();

  try {
    // 1. Verificar token y pertenencia (Seguridad)
    const { data: submission, error: subError } = await supabaseAdmin
      .from("form_submissions")
      .select("id, form_id, payment_group_id")
      .eq("id", submissionId)
      .eq("access_token", accessToken)
      .eq("is_archived", false)
      .single();

    if (subError || !submission) {
      console.error("addMultipartPayment subError:", subError);
      throw new Error("Acceso no autorizado o inscripción no encontrada.");
    }

    let destinationAccount: {
      bank_name?: string | null;
      account_holder?: string | null;
      account_number?: string | null;
    } | null = null;
    let acceptedDestinationAccounts: Array<{
      bank_name?: string | null;
      account_holder?: string | null;
      account_number?: string | null;
    }> = [];

    const { data: form } = await supabaseAdmin
      .from("forms")
      .select("destination_account_id, financial_field_id, financial_field_label, total_amount")
      .eq("id", submission.form_id)
      .maybeSingle();

    const totalAmount = Number(form?.total_amount || 0);
    const paymentGroupId = (submission as any).payment_group_id || null;

    if (paymentGroupId) {
      const { data: paymentGroup } = await supabaseAdmin
        .from("payment_groups")
        .select("id, expected_amount, calculated_expected_amount, expected_amount_source")
        .eq("id", paymentGroupId)
        .maybeSingle();

      const { data: groupPayments } = await supabaseAdmin
        .from("form_submission_payments")
        .select("amount_claimed, extracted_data, status, manual_disposition, created_at")
        .eq("payment_group_id", paymentGroupId);

      const submitted = (groupPayments || [])
        .filter((payment: any) => !payment?.manual_disposition && ["pending", "manual_review", "verified"].includes(payment?.status))
        .reduce((sum: number, payment: any) => sum + Math.abs(Number(payment?.extracted_data?.amount ?? payment?.amount_claimed ?? 0)), 0);
      const expected = Number(
        (paymentGroup as any)?.expected_amount ||
          (paymentGroup as any)?.calculated_expected_amount ||
          0,
      );
      if (expected > 0 && submitted >= expected) {
        return { error: "El total de este grupo de pago ya está cubierto. No necesitas subir otro abono." };
      }
    } else {
      const { data: existingPayments } = await supabaseAdmin
        .from("form_submission_payments")
        .select("amount_claimed, extracted_data, status, manual_disposition")
        .eq("submission_id", submissionId);

      const summary = getSubmissionPaymentSummary(existingPayments || []);
      if (totalAmount > 0 && summary.totalSubmitted >= totalAmount) {
        return { error: "El total de esta inscripción ya está cubierto. No necesitas subir otro abono." };
      }
    }

    if (form?.destination_account_id) {
      const { data: account } = await supabaseAdmin
        .from("bank_accounts")
        .select("bank_name, account_holder, account_number")
        .eq("id", form.destination_account_id)
        .maybeSingle();

      destinationAccount = account || null;
    }

    const { data: activeBankAccounts, error: activeBankAccountsError } = await supabaseAdmin
      .from("bank_accounts")
      .select("bank_name, account_holder, account_number")
      .eq("is_active", true);

    if (activeBankAccountsError) {
      console.error("[Multipart-Payment] Error consultando cuentas bancarias activas:", activeBankAccountsError.message);
    } else {
      acceptedDestinationAccounts = activeBankAccounts || [];
    }

    // 2. Procesar con AI (Gemini)
    console.log(`[Multipart-Payment] Iniciando procesamiento AI para: ${receiptPath}`);
    let aiData = null;
    let aiTransientFailure = false;
    const path = receiptPath.replace('finance_receipts/', '');
    
    const { data: fileBlob, error: dlErr } = await supabaseAdmin.storage
      .from("finance_receipts")
      .download(path);

    if (!dlErr && fileBlob) {
      try {
        const buffer = await fileBlob.arrayBuffer();
        const extraction = await extractReceiptDataDetailed(Buffer.from(buffer).toString('base64'), fileBlob.type);
        aiData = extraction.data;
        aiTransientFailure = extraction.transientFailure;
      } catch (aiErr) {
        console.error("[Multipart-AI] Error Gemini:", aiErr);
        }
    }

    const validation = aiTransientFailure
      ? { status: "manual_review" as const, reason: "La validación automática falló temporalmente." }
      : resolveFinancialReceiptValidation({
          extractedData: aiData,
          destinationAccount,
          acceptedDestinationAccounts,
        });
    if (validation.status === "invalid") {
      const { error: cleanupError } = await supabaseAdmin.storage
        .from("finance_receipts")
        .remove([path]);

      if (cleanupError) {
        console.error("[Multipart-Payment] Error limpiando comprobante inválido:", cleanupError.message);
      }

      const errorMessage =
        validation.reason === UNRECOGNIZED_DESTINATION_ACCOUNT_MESSAGE
          ? validation.reason
          : INVALID_RECEIPT_MESSAGE;

      return { error: errorMessage };
    }

    // 3. Insertar en la tabla de abonos
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("form_submission_payments")
      .insert([{
        submission_id: submissionId,
        receipt_path: receiptPath,
        payment_group_id: paymentGroupId,
        extracted_data: aiData,
        amount_claimed: Math.abs(Number(aiData?.amount ?? amountClaimed ?? 0)),
        status: validation.status === "valid" ? "pending" : "manual_review"
      }])
      .select()
      .single();

    if (payErr) throw payErr;

    await revalidateFormSubmissions(submission.form_id);
    revalidatePath(`/inscripcion/${accessToken}`);
    return { success: true, payment };

  } catch (error: any) {
    console.error("Error en addMultipartPayment:", error);
    return { error: error.message || "Error al registrar el pago" };
  }
}

export async function updatePaymentGroupExpectedAmount(payload: {
  paymentGroupId: string;
  expectedAmount: number;
}) {
  await verifyPermission("perm_finanzas");

  const expectedAmount = Math.abs(Number(payload.expectedAmount || 0));
  if (!payload.paymentGroupId) return { error: "Grupo de pago inválido." };
  if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
    return { error: "Ingresa un total esperado mayor a 0." };
  }

  const supabase = createAdminClient();

  try {
    const { data: group, error } = await supabase
      .from("payment_groups")
      .update({
        expected_amount: expectedAmount,
        expected_amount_source: "manual",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.paymentGroupId)
      .select("id, form_id, expected_amount, calculated_expected_amount, expected_amount_source")
      .single();

    if (error) throw error;

    await revalidateFormSubmissions(group.form_id);
    revalidatePath("/admin/finanzas");
    revalidatePath("/admin/formularios/inscripciones");
    return { success: true, paymentGroup: group };
  } catch (error: any) {
    console.error("Error en updatePaymentGroupExpectedAmount:", error);
    return { error: error.message || "No se pudo actualizar el total del grupo." };
  }
}

/**
 * Super-admin only: properly recovers a submission that is missing its financial receipt.
 * Uploads the file to the finance_receipts bucket, updates form_submissions.data with
 * financial_receipt_path, runs AI extraction, and creates the form_submission_payments record.
 */
export async function reprocessSubmissionWithReceipt(formData: FormData) {
  await verifySuperAdmin();

  const submissionId = formData.get("submissionId") as string;
  const formSlug = formData.get("formSlug") as string;
  const financialFieldLabel = formData.get("financialFieldLabel") as string;

  if (!submissionId || !formSlug || !financialFieldLabel) {
    return { error: "Datos incompletos" };
  }

  const supabaseAdmin = createAdminClient();

  try {
    // 1. Upload file to finance_receipts bucket
    const uploadResult = await uploadReceipt(formData);
    if ("error" in uploadResult || !uploadResult.fullPath) {
      return { error: uploadResult.error ?? "Error al subir el archivo" };
    }
    const { fullPath } = uploadResult;

    // 2. Fetch current submission data
    const { data: submission, error: fetchErr } = await supabaseAdmin
      .from("form_submissions")
      .select("data, answers, form_id")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) {
      return { error: "No se encontró la inscripción" };
    }

    let destinationAccount: {
      bank_name?: string | null;
      account_holder?: string | null;
      account_number?: string | null;
    } | null = null;

    const { data: form } = await supabaseAdmin
      .from("forms")
      .select("destination_account_id")
      .eq("id", submission.form_id)
      .maybeSingle();

    if (form?.destination_account_id) {
      const { data: account } = await supabaseAdmin
        .from("bank_accounts")
        .select("bank_name, account_holder, account_number")
        .eq("id", form.destination_account_id)
        .maybeSingle();

      destinationAccount = account || null;
    }

    // 3. Run AI extraction before touching DB state
    let aiData = null;
    let aiTransientFailure = false;
    const storagePath = fullPath.replace("finance_receipts/", "");
    const { data: fileBlob, error: dlErr } = await supabaseAdmin.storage
      .from("finance_receipts")
      .download(storagePath);

    if (!dlErr && fileBlob) {
      try {
        const buffer = await fileBlob.arrayBuffer();
        const extraction = await extractReceiptDataDetailed(Buffer.from(buffer).toString("base64"), fileBlob.type);
        aiData = extraction.data;
        aiTransientFailure = extraction.transientFailure;
      } catch (aiErr) {
        console.error("[Reprocess-AI] Error Gemini:", aiErr);
      }
    }

    const validation = aiTransientFailure
      ? { status: "manual_review" as const, reason: "La validación automática falló temporalmente." }
      : classifyFinancialReceipt(aiData, destinationAccount);
    if (validation.status === "invalid") {
      const cleanupPath = fullPath.replace("finance_receipts/", "");
      const { error: cleanupError } = await supabaseAdmin.storage
        .from("finance_receipts")
        .remove([cleanupPath]);

      if (cleanupError) {
        console.error("[Reprocess] Error limpiando comprobante inválido:", cleanupError.message);
      }

      return { error: INVALID_RECEIPT_MESSAGE };
    }

    // 4. Merge financial_receipt_path into the field object (preserve existing metadata)
    const currentData = submission.data as Record<string, any>;
    const formWithFinancialField = form as any;
    const matchingFieldKey =
      formWithFinancialField?.financial_field_id
        ? formWithFinancialField.financial_field_id
        : financialFieldLabel;
    const existingFieldValue =
      currentData[matchingFieldKey] ?? currentData[financialFieldLabel];
    const updatedFieldValue =
      existingFieldValue && typeof existingFieldValue === "object"
        ? { ...existingFieldValue, financial_receipt_path: fullPath }
        : { _type: "file", info: "Archivo en Drive", financial_receipt_path: fullPath };

    const updatedData = {
      ...currentData,
      [matchingFieldKey]: updatedFieldValue,
      [financialFieldLabel]: updatedFieldValue,
    };
    const updatedAnswers = Array.isArray(submission.answers)
      ? submission.answers.map((answer: any) => {
          const answerFieldId = answer?.field_id;
          const answerLabel = normalizeFormKey(answer?.label || answer?.key);
          const matchesFieldId = formWithFinancialField?.financial_field_id && answerFieldId === formWithFinancialField.financial_field_id;
          const matchesLabel = answerLabel === normalizeFormKey(financialFieldLabel);
          if (!matchesFieldId && !matchesLabel) return answer;
          const value = answer?.value && typeof answer.value === "object"
            ? { ...answer.value, financial_receipt_path: fullPath }
            : { _type: "file", info: "Archivo en Drive", financial_receipt_path: fullPath };
          return { ...answer, value };
        })
      : [];

    const { error: updateErr } = await supabaseAdmin
      .from("form_submissions")
      .update({ data: updatedData, answers: updatedAnswers })
      .eq("id", submissionId);

    if (updateErr) throw updateErr;

    // 5. Create form_submission_payments record
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("form_submission_payments")
      .insert([{
        submission_id: submissionId,
        receipt_path: fullPath,
        extracted_data: aiData,
        status: validation.status === "valid" ? "pending" : "manual_review",
      }])
      .select()
      .single();

    if (payErr) throw payErr;

    await revalidateFormSubmissions(submission.form_id);
    return { success: true, payment };
  } catch (error: any) {
    console.error("Error en reprocessSubmissionWithReceipt:", error);
    return { error: error.message || "Error al reprocesar la inscripción" };
  }
}
