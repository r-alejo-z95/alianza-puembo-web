import { NextResponse } from "next/server";
import { verifyPermission } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeFinanceReceiptPath } from "@/lib/finance/receipt-links.mjs";

export async function GET(request) {
  await verifyPermission("perm_finanzas");

  const requestUrl = new URL(request.url);
  const storagePath = normalizeFinanceReceiptPath(requestUrl.searchParams.get("path"));

  if (!storagePath) {
    return new NextResponse("Ruta inválida", { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .storage
    .from("finance_receipts")
    .createSignedUrl(storagePath, 120);

  if (error || !data?.signedUrl) {
    return new NextResponse("Comprobante no encontrado", { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
