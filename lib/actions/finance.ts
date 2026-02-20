"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { extractReceiptData, parseBankStatementWithAI } from "@/lib/services/ai-reconciliation";
import { revalidatePath } from "next/cache";

/**
 * Step 1: Initialize a bank report
 */
export async function initBankReport(filename: string): Promise<{ reportId?: string, error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: report, error: reportErr } = await supabase
      .from("bank_reports")
      .insert([{ filename, created_by: user?.id }])
      .select().single();

    if (reportErr) throw reportErr;
    return { reportId: report.id };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Step 2: Process a chunk of data rows
 */
export async function processBankChunk(reportId: string, chunk: any[][], headers: any[]): Promise<{ success: boolean, error?: string }> {
  try {
    const supabase = await createClient();
    const extracted = await parseBankStatementWithAI(chunk, headers);

    if (!extracted || extracted.length === 0) return { success: true };

    const dbTransactions = extracted.map(t => ({
      report_id: reportId,
      date: t.date,
      amount: t.amount,
      description: t.description || (t.sender_name 
        ? `Depósito - ${t.sender_name}` 
        : 'Depósito'),
      reference: String(t.reference || "").trim(),
      bank_name: t.bank_name || "Desconocido"
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
 */
export async function getGlobalTransactions() {
  const supabase = await createClient();
  
  // 1. Get all transactions
  const { data: transactions, error: txError } = await supabase
    .from("bank_transactions")
    .select("*")
    .order("date", { ascending: false });

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
      .select("financial_field_label")
      .eq("id", formId)
      .single();

    if (!form?.financial_field_label) throw new Error("Formulario no configurado");

    const { data: submissions, error: subError } = await supabase
      .from("form_submissions")
      .select("*, profiles(full_name, email), form_submission_payments(id, receipt_path, extracted_data, status)")
      .eq("form_id", formId)
      .eq("is_archived", false);

    if (subError) throw subError;

    for (const sub of submissions) {
      const targetLabel = form.financial_field_label.trim();
      const actualKey = Object.keys(sub.data || {}).find(k => k.trim() === targetLabel);
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
      .select("id")
      .eq("id", submissionId)
      .eq("access_token", accessToken)
      .single();

    if (subError || !submission) {
        console.error("addMultipartPayment subError:", subError);
        throw new Error("Acceso no autorizado o inscripción no encontrada.");
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

    // 3. Insertar en la tabla de abonos
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("form_submission_payments")
      .insert([{
        submission_id: submissionId,
        receipt_path: receiptPath,
        extracted_data: aiData,
        amount_claimed: amountClaimed || 0,
        status: aiData?.is_valid_receipt ? 'pending' : 'manual_review'
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