"use server";

import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { extractReceiptData, parseBankStatementWithAI } from "@/lib/services/ai-reconciliation";
import { revalidatePath } from "next/cache";

/**
 * Global Bank Report Upload (Independent of forms)
 */
export async function parseBankReport(formData: FormData): Promise<{ reportId?: string, error?: string }> {
  const file = formData.get("file") as File;
  if (!file) return { error: "No se proporcionó archivo" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const buffer = await file.arrayBuffer();
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: isCSV });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    const cleanRows = rawData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== "" && cell !== undefined));
    if (cleanRows.length < 2) return { error: "Archivo sin datos legibles" };

    const headers = cleanRows[0];
    const dataRows = cleanRows.slice(1);

    // AI Chunk Processing
    const CHUNK_SIZE = 50;
    const allTransactions = [];
    for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
      const chunk = dataRows.slice(i, i + CHUNK_SIZE);
      const extracted = await parseBankStatementWithAI(chunk, headers);
      if (extracted) allTransactions.push(...extracted);
    }

    if (allTransactions.length === 0) {
      return { error: "La IA no detectó ingresos en este archivo." };
    }

    // 1. Save Report Audit (Optional reference)
    const { data: report, error: reportErr } = await supabase
      .from("bank_reports")
      .insert([{ filename: file.name, created_by: user?.id }])
      .select().single();

    if (reportErr) throw reportErr;

    // 2. Save Global Transactions with Dedup
    const dbTransactions = allTransactions.map(t => ({
      report_id: report.id,
      date: t.date,
      amount: t.amount,
      description: t.sender_name 
        ? `${t.description || 'Depósito'} - ${t.sender_name}` 
        : (t.description || 'Depósito'),
      reference: String(t.reference || "").trim(),
      bank_name: t.bank_name || "Desconocido"
    }));

    // We use ON CONFLICT based on the global unique constraint: date, amount, description, reference
    const { error: batchErr } = await supabase.from("bank_transactions").upsert(dbTransactions, { 
      onConflict: 'date, amount, description, reference',
      ignoreDuplicates: true 
    });

    if (batchErr) {
      console.warn("[Finance] Dedup warning:", batchErr.message);
    }

    revalidatePath("/admin/finanzas");
    return { reportId: report.id };
  } catch (e: any) {
    console.error("Error parsing bank report:", e);
    return { error: e.message };
  }
}

/**
 * Gets the entire church-wide bank pool.
 */
export async function getGlobalTransactions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_transactions")
    .select("*")
    .order("date", { ascending: false });
  return error ? { error: error.message } : { transactions: data };
}

/**
 * Analyzes receipts and updates status for a specific form.
 */
export async function analyzeFormReceipts(formId: string) {
  const supabase = await createClient();

  try {
    const { data: form } = await supabase
      .from("forms")
      .select("financial_field_label")
      .eq("id", formId)
      .single();

    if (!form?.financial_field_label) throw new Error("Formulario no configurado");

    const { data: submissions, error: subError } = await supabase
      .from("form_submissions")
      .select("*, profiles(full_name, email)")
      .eq("form_id", formId)
      .eq("is_archived", false);

    if (subError) throw subError;

    for (const sub of submissions) {
      // Skip if already has AI data or is verified
      if (sub.financial_data || sub.financial_status === 'verified') continue;

      const path = sub.data[form.financial_field_label]?.financial_receipt_path;
      if (!path) continue;

      const { data: fileBlob, error: dlErr } = await supabase.storage
        .from("finance_receipts")
        .download(path.replace('finance_receipts/', ''));

      if (dlErr) continue;

      const buffer = await fileBlob.arrayBuffer();
      const aiData = await extractReceiptData(Buffer.from(buffer).toString('base64'), fileBlob.type);

      await supabase
        .from("form_submissions")
        .update({
          financial_data: aiData,
          financial_status: aiData.is_valid_receipt ? 'pending' : 'manual_review',
        })
        .eq("id", sub.id);
    }

    // Refetch final data
    const { data: updated } = await supabase
      .from("form_submissions")
      .select("*, profiles(full_name, email)")
      .eq("form_id", formId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    return { success: true, submissions: updated };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Validates a payment by linking it to a bank transaction.
 */
export async function updateFinancialStatus(submissionId: string, status: string, notes?: string, matchId?: string) {
  const supabase = await createClient();
  const updateData: any = { financial_status: status, reconciliation_notes: notes };
  
  if (matchId) {
    updateData.bank_transaction_id = matchId;
  }

  const { error } = await supabase.from("form_submissions").update(updateData).eq("id", submissionId);
  
  revalidatePath("/admin/finanzas");
  return error ? { error: error.message } : { success: true };
}

/**
 * Gets temporary URL for visual audit.
 */
export async function getReceiptSignedUrl(fullPath: string) {
  const supabase = await createClient();
  const path = fullPath.replace('finance_receipts/', '');
  const { data, error } = await supabase.storage.from("finance_receipts").createSignedUrl(path, 600);
  return error ? { error: error.message } : { url: data.signedUrl };
}