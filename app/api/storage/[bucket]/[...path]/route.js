import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { bucket, path } = await params;
  const supabase = await createClient();

  // Reconstruir la ruta de Supabase (ej: ["fields", "uuid", "archivo.pdf"] -> "fields/uuid/archivo.pdf")
  const supaPath = path.join("/");

  // 1. Descargar el archivo
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(supaPath);

  if (error || !data) {
    console.error("Storage Proxy Error:", error);
    return new NextResponse("File not found", { status: 404 });
  }

  // 2. Determinar el Content-Type
  const contentType = data.type || "application/octet-stream";
  const filename = path[path.length - 1];

  // 3. Retornar el archivo
  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
