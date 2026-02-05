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

  // SECURITY: Limit file size to 5MB to prevent memory exhaustion
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) return { error: "El archivo es demasiado grande (máx 5MB)" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let buffer: any = await file.arrayBuffer();
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    
    let workbook: any = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: isCSV });
    if (!workbook.SheetNames.length) return { error: "Archivo Excel inválido" };

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    // MEMORY MANAGEMENT: Clear heavy objects after extraction
    buffer = null;
    workbook = null;
    
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

    // 1. Save Report Audit
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

    const { error: batchErr } = await supabase.from("bank_transactions").upsert(dbTransactions, { 
      onConflict: 'date, amount, description, reference',
      ignoreDuplicates: true 
    });

    if (batchErr) console.warn("[Finance] Dedup warning:", batchErr.message);

    revalidatePath("/admin/finanzas");
    return { reportId: report.id };
  } catch (e: any) {
    console.error("Error parsing bank report:", e);
    return { error: e.message };
  }
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

  // 2. Get all reconciled IDs across ALL submissions in the database
  const { data: reconciled, error: recError } = await supabase
    .from("form_submissions")
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
      if (sub.financial_data || sub.financial_status === 'verified') continue;

      const path = sub.data[form.financial_field_label]?.financial_receipt_path;
      if (!path || path.includes('..')) continue;

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

      const { data: submissions, error: subErr } = await supabase
        .from("form_submissions")
        .select(`
          id,
          financial_status,
          bank_transactions (
            amount
          )
        `)
        .eq("form_id", form.id)
        .eq("is_archived", false);

      if (subErr) continue;

      const totalInscribed = submissions.length;
      const verifiedAmount = submissions
        .filter(s => s.financial_status === 'verified' && s.bank_transactions)
        .reduce((acc, curr) => {
          const tx = Array.isArray(curr.bank_transactions) ? curr.bank_transactions[0] : curr.bank_transactions;
          return acc + (tx?.amount || 0);
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