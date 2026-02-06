import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- NEW OAUTH 2.0 FLOW WITH CACHING ---

async function getAccessToken(supabase) {
  // 1. Intentar obtener el token cacheado
  const { data, error } = await supabase
    .from("google_integration")
    .select("refresh_token, access_token, expires_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error(
      "No Google integration found. Please connect a Google account in the admin panel.",
    );
  }

  // 2. Verificar si el token actual aún es válido (con margen de 5 min)
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutos de seguridad
  
  if (data.access_token && data.expires_at && new Date(data.expires_at).getTime() > (now.getTime() + bufferTime)) {
    return data.access_token;
  }

  // 3. Si expiró o no existe, pedir uno nuevo
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const tokens = await response.json();

  if (!response.ok) {
    console.error("Failed to refresh access token:", tokens);
    throw new Error(
      "Could not refresh Google access token. The integration might need to be re-authorized.",
    );
  }

  // 4. Guardar el nuevo token en la base de datos para la siguiente persona
  const expiresAt = new Date(now.getTime() + tokens.expires_in * 1000).toISOString();
  await supabase
    .from("google_integration")
    .update({ 
      access_token: tokens.access_token, 
      expires_at: expiresAt,
      updated_at: now.toISOString() 
    })
    .eq("id", 1);

  return tokens.access_token;
}

// --- GOOGLE API HELPER FUNCTIONS (UNCHANGED) ---

async function createDriveFolder(accessToken, name) {
  const response = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(`Failed to create folder: ${JSON.stringify(data)}`);
  return data.id;
}

async function createGoogleSheet(accessToken, title) {
  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties: { title } }),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(`Failed to create sheet: ${JSON.stringify(data)}`);
  return data.spreadsheetId;
}

async function getFirstSheetName(accessToken, spreadsheetId) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet info: ${JSON.stringify(data)}`);
  }

  const sheetProperties = data.sheets?.[0]?.properties;
  return {
    name: sheetProperties?.title || "Sheet1",
    id: sheetProperties?.sheetId,
  };
}

async function appendToSheet(accessToken, spreadsheetId, values, sheetName) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=RAW`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to append to sheet: ${JSON.stringify(error)}`);
  }
}

async function updateSheetRow(
  accessToken,
  spreadsheetId,
  sheetName,
  rowNumber,
  values,
) {
  const range = `${encodeURIComponent(sheetName)}!A${rowNumber}`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update sheet row: ${JSON.stringify(error)}`);
  }
}

async function uploadFileToDrive(
  accessToken,
  folderId,
  fileName,
  fileData,
  mimeType,
) {
  const metadataResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: fileName, parents: [folderId] }),
    },
  );
  if (!metadataResponse.ok)
    throw new Error(
      `Failed to initiate file upload: ${metadataResponse.statusText}`,
    );

  const uploadUrl = metadataResponse.headers.get("location");
  if (!uploadUrl) throw new Error("No upload URL received");

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: fileData,
  });
  if (!uploadResponse.ok)
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);

  const fileDataResult = await uploadResponse.json();
  if (!fileDataResult.webViewLink) {
    throw new Error(
      `File uploaded but no webViewLink received for ${fileName}. Response: ${JSON.stringify(fileDataResult)}`,
    );
  }
  return fileDataResult.webViewLink;
}

async function formatSheetHeaders(accessToken, spreadsheetId, sheetId) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                  horizontalAlignment: "CENTER",
                  textFormat: {
                    bold: true,
                    fontSize: 10,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,horizontalAlignment,textFormat)",
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 50,
              },
            },
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`Failed to format sheet headers: ${JSON.stringify(error)}`);
  }
}

async function applyInitialFormatting(accessToken, spreadsheetId, sheetId) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            addBanding: {
              bandedRange: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 100,
                  startColumnIndex: 0,
                  endColumnIndex: 30,
                },
                rowProperties: {
                  headerColor: { red: 0.9, green: 0.9, blue: 0.9 },
                  firstBandColor: { red: 1, green: 1, blue: 1 },
                  secondBandColor: { red: 0.95, green: 0.95, blue: 0.95 },
                },
              },
            },
          },
          {
            addProtectedRange: {
              protectedRange: {
                range: { sheetId: sheetId },
                description: "Respuestas automáticas",
                warningOnly: true,
              },
            },
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    console.warn(
      `Initial formatting warning (might already exist): ${JSON.stringify(error)}`,
    );
  }
}

async function getSheetHeaders(accessToken, spreadsheetId, sheetName) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!1:1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get sheet headers: ${JSON.stringify(data)}`);
  }
  return data.values ? data.values[0] : [];
}

// --- MAIN SERVER ---

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: CORS_HEADERS });
    }

    if (url.pathname === "/sheets-drive-integration/create-sheet") {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
          status: 405,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      try {
        const requestBody = await req.json();
        const {
          formId,
          formTitle,
          formSlug,
          formFields: providedFields,
        } = requestBody;
        if (!formId || !formTitle || !formSlug) {
          return new Response(
            JSON.stringify({ error: "Missing formId, formTitle or formSlug" }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            },
          );
        }

        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          { auth: { persistSession: false } },
        );

        const accessToken = await getAccessToken(supabase);

        // 1. Get form fields to initialize headers
        let headers: string[] = ["Timestamp"];

        if (providedFields && Array.isArray(providedFields)) {
          headers = [
            "Timestamp",
            ...providedFields.map((f: any) => f.label || f.name || "Pregunta"),
          ];
        } else {
          // Fetch from database if not provided (fallback for existing forms)
          const { data: dbFields, error: fetchError } = await supabase
            .from("form_fields")
            .select("label, name")
            .eq("form_id", formId)
            .order("id", { ascending: true });

          if (!fetchError && dbFields && dbFields.length > 0) {
            headers = [
              "Timestamp",
              ...dbFields.map((f: any) => f.label || f.name || "Pregunta"),
            ];
          }
        }

        // 2. Create Drive Folder and Sheet
        const [folderId, sheetId] = await Promise.all([
          createDriveFolder(accessToken, formTitle),
          createGoogleSheet(accessToken, formTitle),
        ]);

        const sheetInfo = await getFirstSheetName(accessToken, sheetId);

        // 3. Initialize headers and formatting
        await Promise.all([
          appendToSheet(accessToken, sheetId, [headers], sheetInfo.name),
          applyInitialFormatting(accessToken, sheetId, sheetInfo.id),
          formatSheetHeaders(accessToken, sheetId, sheetInfo.id),
        ]);

        // 4. Update Supabase with the new IDs
        const { error: updateError } = await supabase
          .from("forms")
          .update({
            google_sheet_id: sheetId,
            google_drive_folder_id: folderId,
            google_sheet_url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
          })
          .eq("id", formId);

        if (updateError) {
          throw new Error(
            `Sheet created but failed to update database: ${updateError.message}`,
          );
        }

        return new Response(JSON.stringify({ sheetId, folderId, formSlug }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message, details: err.stack }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          },
        );
      }
    } else if (url.pathname.endsWith("/sheets-drive-integration")) {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
          status: 405,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      try {
        const { formId, formData } = await req.json();
        if (!formId || !formData) {
          return new Response(
            JSON.stringify({ error: "Missing formId or formData" }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            },
          );
        }

        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          { auth: { persistSession: false } },
        );

        const { data: form, error: formError } = await supabase
          .from("forms")
          .select("google_sheet_id, google_drive_folder_id, title")
          .eq("id", formId)
          .single();

        if (formError || !form) {
          return new Response(JSON.stringify({ error: "Form not found" }), {
            status: 404,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }

        const accessToken = await getAccessToken(supabase);

        let { google_sheet_id: sheetId, google_drive_folder_id: folderId } =
          form;
        const currentFormDataHeaders = Object.keys(formData).filter(
          (h) => h !== "Timestamp",
        );
        let sheetInfo;
        let finalHeaders;

        if (!sheetId || !folderId) {
          folderId = await createDriveFolder(accessToken, form.title);
          sheetId = await createGoogleSheet(accessToken, form.title);

          await supabase
            .from("forms")
            .update({
              google_sheet_id: sheetId,
              google_drive_folder_id: folderId,
              google_sheet_url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
            })
            .eq("id", formId);

          sheetInfo = await getFirstSheetName(accessToken, sheetId);
          finalHeaders = ["Timestamp", ...currentFormDataHeaders];
          await appendToSheet(
            accessToken,
            sheetId,
            [finalHeaders],
            sheetInfo.name,
          );
          await applyInitialFormatting(accessToken, sheetId, sheetInfo.id);
          await formatSheetHeaders(accessToken, sheetId, sheetInfo.id);
        } else {
          sheetInfo = await getFirstSheetName(accessToken, sheetId);
          const existingSheetHeaders = await getSheetHeaders(
            accessToken,
            sheetId,
            sheetInfo.name,
          );

          // Ensure Timestamp is first
          let baseHeaders = [...existingSheetHeaders];
          let headersChanged = false;

          if (baseHeaders.length === 0 || baseHeaders[0] !== "Timestamp") {
            baseHeaders = [
              "Timestamp",
              ...baseHeaders.filter((h) => h !== "Timestamp"),
            ];
            headersChanged = true;
          }

          const newHeadersToAdd = currentFormDataHeaders.filter(
            (header) => !baseHeaders.includes(header),
          );

          if (newHeadersToAdd.length > 0 || headersChanged) {
            finalHeaders = [...baseHeaders, ...newHeadersToAdd];
            await updateSheetRow(
              accessToken,
              sheetId,
              sheetInfo.name,
              1,
              finalHeaders,
            );
            if (existingSheetHeaders.length === 0) {
              await applyInitialFormatting(accessToken, sheetId, sheetInfo.id);
            }
            await formatSheetHeaders(accessToken, sheetId, sheetInfo.id);
          } else {
            finalHeaders = baseHeaders;
          }
        }

        const rowData = {
          Timestamp: new Date().toLocaleString("es-EC", {
            timeZone: "America/Guayaquil",
          }),
        };

        const fileUrls: Record<string, string> = {};
        const uploadPromises: Promise<any>[] = [];

        for (const key in formData) {
          if (key === "Timestamp") continue;
          const value = formData[key];
          if (
            value &&
            typeof value === "object" &&
            value.type === "file" &&
            value.name &&
            value.data
          ) {
            const uploadTask = (async () => {
              try {
                const base64Data = value.data.includes(",")
                  ? value.data.split(",")[1]
                  : value.data;
                const mimeType =
                  value.mimeType || "application/octet-stream";
                const binaryString = atob(base64Data);
                const binaryData = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  binaryData[i] = binaryString.charCodeAt(i);
                }
                const fileUrl = await uploadFileToDrive(
                  accessToken,
                  folderId,
                  value.name,
                  binaryData,
                  mimeType,
                );
                rowData[key] = fileUrl;
                fileUrls[key] = fileUrl;
              } catch (fileError) {
                console.error(`Error uploading file ${value.name}:`, fileError);
                rowData[key] = `Error uploading file: ${value.name}`;
              }
            })();
            uploadPromises.push(uploadTask);
          } else if (value && typeof value === "object") {
            rowData[key] = "";
          } else {
            rowData[key] = String(value ?? "");
          }
        }

        // Wait for all uploads in parallel
        await Promise.all(uploadPromises);

        const values = finalHeaders.map((header) => rowData[header] || "");
        await appendToSheet(accessToken, sheetId, [values], sheetInfo.name);

        // Async formatting - Fire and forget
        formatSheetHeaders(accessToken, sheetId, sheetInfo.id).catch(e => console.error("Formatting error:", e));

        return new Response(
          JSON.stringify({
            message: "Datos enviados correctamente",
            sheetId,
            folderId,
            fileUrls,
          }),
          {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          },
        );
      } catch (err) {
        console.error("Error in edge function:", err);
        return new Response(
          JSON.stringify({ error: err.message, details: err.stack }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
  } catch (globalError) {
    console.error("Global Edge Function Error:", globalError);
    return new Response(
      JSON.stringify({
        error: globalError.message,
        details: globalError.stack,
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }
});
