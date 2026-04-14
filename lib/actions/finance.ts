"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { extractReceiptData, parseBankStatementWithAI } from "@/lib/services/ai-reconciliation";
import { revalidatePath } from "next/cache";
import { verifyPermission, verifySuperAdmin } from "@/lib/auth/guards";
import { uploadReceipt } from "@/lib/actions";
import { INVALID_RECEIPT_MESSAGE, classifyFinancialReceipt } from "@/lib/services/receipt-validation";

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

  // 2. Get all reconciled IDs across ALL payments in the database
  const { data: reconciled, error: recError } = await supabase
    .from("form_submission_payments")
    .select("bank_transaction_id")
    .not("bank_transaction_id", "is", null);

  const reconciledIds = new Set(reconciled?.map(r => r.bank_transaction_id) || []);

  const enhancedTransactions = transactions.map(tx => ({
    ...tx,
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
      .select("*, profiles(full_name, email), form_submission_payments(id, receipt_path, extracted_data, status)")
      .eq("form_id", formId)
      .eq("is_archived", false);

    if (subError) throw subError;

    for (const sub of submissions) {
      const financialField = (form as any).form_fields?.find((f: any) => f.id === (form as any).financial_field_id);
      const targetLabel = (financialField?.label ?? form.financial_field_label ?? "").trim();
      const actualKey = targetLabel
        ? Object.keys(sub.data || {}).find(k => k.trim().toLowerCase() === targetLabel.toLowerCase())
        : undefined;
      const mainPath = actualKey ? sub.data[actualKey]?.financial_receipt_path : null;

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
                      aiData = await extractReceiptData(Buffer.from(buffer).toString('base64'), fileBlob.type);
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
      .select("*, profiles(full_name, email), form_submission_payments(*)")
      .eq("form_id", formId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    return { success: true, submissions: updated };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Concilia un abono específico con una transacción bancaria.
 */
export async function reconcilePayment(paymentId: string, transactionId: string, notes?: string) {
  const supabase = await createClient();
  
  try {
    // 1. Actualizar el abono
    const { data: payment, error: payErr } = await supabase
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
      .select("id, extracted_data, amount_claimed, status, reconciliation_notes")
      .eq("id", paymentId)
      .single();

    if (fetchErr) throw fetchErr;
    if (!currentPayment) throw new Error("Pago no encontrado");

    const mergedExtractedData = {
      ...(currentPayment.extracted_data || {}),
      ...(payload.extractedData || {}),
    };

    const { error: updateErr } = await supabase
      .from("form_submission_payments")
      .update({
        extracted_data: mergedExtractedData,
        amount_claimed:
          payload.amountClaimed !== undefined && payload.amountClaimed !== null
            ? payload.amountClaimed
            : currentPayment.amount_claimed,
        status: payload.status || currentPayment.status || "manual_review",
        reconciliation_notes:
          payload.notes !== undefined ? payload.notes : currentPayment.reconciliation_notes,
      })
      .eq("id", paymentId);

    if (updateErr) throw updateErr;

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
            status
          )
        `)
        .eq("form_id", form.id)
        .eq("is_archived", false);

      if (subErr) continue;

      const totalInscribed = submissions.length;
      const verifiedAmount = submissions.reduce((acc, submission) => {
        const payments = submission.form_submission_payments || [];
        return acc + payments
          .filter(p => p.status === 'verified')
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
  if (fullPath.includes('..')) return { error: "Ruta inválida" };
  const supabase = await createClient();
  const path = fullPath.replace('finance_receipts/', '');
  const { data, error } = await supabase.storage.from("finance_receipts").createSignedUrl(path, 600);
  return error ? { error: error.message } : { url: data.signedUrl };
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
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  try {
    // 1. Verificar token y pertenencia (Seguridad)
    const { data: submission, error: subError } = await supabase
      .from("form_submissions")
      .select("id, form_id")
      .eq("id", submissionId)
      .eq("access_token", accessToken)
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

    // 2. Procesar con AI (Gemini)
    console.log(`[Multipart-Payment] Iniciando procesamiento AI para: ${receiptPath}`);
    let aiData = null;
    const path = receiptPath.replace('finance_receipts/', '');
    
    const { data: fileBlob, error: dlErr } = await supabaseAdmin.storage
      .from("finance_receipts")
      .download(path);

    if (!dlErr && fileBlob) {
      try {
        const buffer = await fileBlob.arrayBuffer();
        aiData = await extractReceiptData(Buffer.from(buffer).toString('base64'), fileBlob.type);
      } catch (aiErr) {
        console.error("[Multipart-AI] Error Gemini:", aiErr);
        }
    }

    const validation = classifyFinancialReceipt(aiData, destinationAccount);
    if (validation.status === "invalid") {
      const { error: cleanupError } = await supabaseAdmin.storage
        .from("finance_receipts")
        .remove([path]);

      if (cleanupError) {
        console.error("[Multipart-Payment] Error limpiando comprobante inválido:", cleanupError.message);
      }

      return { error: INVALID_RECEIPT_MESSAGE };
    }

    // 3. Insertar en la tabla de abonos
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("form_submission_payments")
      .insert([{
        submission_id: submissionId,
        receipt_path: receiptPath,
        extracted_data: aiData,
        amount_claimed: amountClaimed || 0,
        status: validation.status === "valid" ? "pending" : "manual_review"
      }])
      .select()
      .single();

    if (payErr) throw payErr;

    revalidatePath(`/inscripcion/${accessToken}`);
    return { success: true, payment };

  } catch (error: any) {
    console.error("Error en addMultipartPayment:", error);
    return { error: error.message || "Error al registrar el pago" };
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
      .select("data, form_id")
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
    const storagePath = fullPath.replace("finance_receipts/", "");
    const { data: fileBlob, error: dlErr } = await supabaseAdmin.storage
      .from("finance_receipts")
      .download(storagePath);

    if (!dlErr && fileBlob) {
      try {
        const buffer = await fileBlob.arrayBuffer();
        aiData = await extractReceiptData(Buffer.from(buffer).toString("base64"), fileBlob.type);
      } catch (aiErr) {
        console.error("[Reprocess-AI] Error Gemini:", aiErr);
      }
    }

    const validation = classifyFinancialReceipt(aiData, destinationAccount);
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
    const existingFieldValue = currentData[financialFieldLabel];
    const updatedFieldValue =
      existingFieldValue && typeof existingFieldValue === "object"
        ? { ...existingFieldValue, financial_receipt_path: fullPath }
        : { _type: "file", info: "Archivo en Drive", financial_receipt_path: fullPath };

    const updatedData = { ...currentData, [financialFieldLabel]: updatedFieldValue };

    const { error: updateErr } = await supabaseAdmin
      .from("form_submissions")
      .update({ data: updatedData })
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

    return { success: true, payment };
  } catch (error: any) {
    console.error("Error en reprocessSubmissionWithReceipt:", error);
    return { error: error.message || "Error al reprocesar la inscripción" };
  }
}
