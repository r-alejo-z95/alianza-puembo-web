import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- NEW OAUTH 2.0 FLOW ---

// Function to get a new access token using the stored refresh token
async function getAccessToken(supabase) {
  // 1. Get the refresh token from the database
  const { data, error } = await supabase
    .from('google_integration')
    .select('refresh_token')
    .eq('id', 1)
    .single();

  if (error || !data) {
    throw new Error('No Google integration found. Please connect a Google account in the admin panel.');
  }

  const refreshToken = data.refresh_token;

  // 2. Exchange the refresh token for a new access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const tokens = await response.json();

  if (!response.ok) {
    console.error('Failed to refresh access token:', tokens);
    throw new Error('Could not refresh Google access token. The integration might need to be re-authorized.');
  }

  return tokens.access_token;
}

// --- GOOGLE API HELPER FUNCTIONS (UNCHANGED) ---

async function createDriveFolder(accessToken, name) {
  const response = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Failed to create folder: ${JSON.stringify(data)}`);
  return data.id;
}

async function createGoogleSheet(accessToken, title) {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties: { title } }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Failed to create sheet: ${JSON.stringify(data)}`);
  return data.spreadsheetId;
}

async function getFirstSheetName(accessToken, spreadsheetId) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet info: ${JSON.stringify(data)}`);
  }

  const sheetProperties = data.sheets?.[0]?.properties;
  return { name: sheetProperties?.title || "Sheet1", id: sheetProperties?.sheetId };
}

async function appendToSheet(accessToken, spreadsheetId, values, sheetName) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=RAW`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to append to sheet: ${JSON.stringify(error)}`);
  }
}

async function updateSheetRow(accessToken, spreadsheetId, sheetName, rowNumber, values) {
  const range = `${encodeURIComponent(sheetName)}!A${rowNumber}`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update sheet row: ${JSON.stringify(error)}`);
  }
}

async function uploadFileToDrive(accessToken, folderId, fileName, fileData, mimeType) {
  const metadataResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: fileName, parents: [folderId] }),
  });
  if (!metadataResponse.ok) throw new Error(`Failed to initiate file upload: ${metadataResponse.statusText}`);
  
  const uploadUrl = metadataResponse.headers.get("location");
  if (!uploadUrl) throw new Error("No upload URL received");

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: fileData,
  });
  if (!uploadResponse.ok) throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  
  const fileDataResult = await uploadResponse.json();
  if (!fileDataResult.webViewLink) {
    throw new Error(`File uploaded but no webViewLink received for ${fileName}. Response: ${JSON.stringify(fileDataResult)}`);
  }
  return fileDataResult.webViewLink;
}

async function formatSheetHeaders(accessToken, spreadsheetId, sheetId) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
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
                textFormat: {
                  bold: true,
                },
              },
            },
            fields: "userEnteredFormat.textFormat.bold",
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to format sheet headers: ${JSON.stringify(error)}`);
  }
}

async function getSheetHeaders(accessToken, spreadsheetId, sheetName) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!1:1`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get sheet headers: ${JSON.stringify(data)}`);
  }
  return data.values ? data.values[0] : [];
}

// --- MAIN SERVER ---

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { formId, formData } = await req.json();
    if (!formId || !formData) {
      return new Response(JSON.stringify({ error: "Missing formId or formData" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
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

    let { google_sheet_id: sheetId, google_drive_folder_id: folderId } = form;
    const currentFormDataHeaders = Object.keys(formData);
    let sheetInfo;
    let finalHeaders;

    if (!sheetId || !folderId) {
      // First time submission: create sheet, folder, and add headers
      folderId = await createDriveFolder(accessToken, form.title);
      sheetId = await createGoogleSheet(accessToken, form.title);

      await supabase
        .from("forms")
        .update({ google_sheet_id: sheetId, google_drive_folder_id: folderId })
        .eq("id", formId);

      sheetInfo = await getFirstSheetName(accessToken, sheetId);
      finalHeaders = currentFormDataHeaders; // Initial headers are just form data headers
      await appendToSheet(accessToken, sheetId, [finalHeaders], sheetInfo.name);
      await formatSheetHeaders(accessToken, sheetId, sheetInfo.id);

    } else {
      // Subsequent submissions: check for new headers
      sheetInfo = await getFirstSheetName(accessToken, sheetId);
      const existingSheetHeaders = await getSheetHeaders(accessToken, sheetId, sheetInfo.name);

      const newHeadersToAdd = currentFormDataHeaders.filter(
        (header) => !existingSheetHeaders.includes(header)
      );

      if (newHeadersToAdd.length > 0) {
        // Append new headers to the existing ones
        finalHeaders = [...existingSheetHeaders, ...newHeadersToAdd];
        // Update the first row with the new set of headers
        await updateSheetRow(accessToken, sheetId, sheetInfo.name, 1, finalHeaders);
        // Re-apply bold formatting to the updated header row
        await formatSheetHeaders(accessToken, sheetId, sheetInfo.id);
      } else {
        finalHeaders = existingSheetHeaders; // No new headers, use existing ones
      }
    }

    const rowData = {};
    for (const key in formData) {
      const value = formData[key];
      if (typeof value === 'object' && value?.type === 'file' && value.name && value.data) {
        try {
          const base64Data = value.data.includes(',') ? value.data.split(',')[1] : value.data;
          const mimeType = value.data.match(/data:(.*?);base64,/)?.[1] || "application/octet-stream";
          const binaryString = atob(base64Data);
          const binaryData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            binaryData[i] = binaryString.charCodeAt(i);
          }
          const fileUrl = await uploadFileToDrive(accessToken, folderId, value.name, binaryData, mimeType);
          rowData[key] = fileUrl;
        } catch (fileError) {
          console.error(`Error uploading file ${value.name}:`, fileError);
          rowData[key] = `Error uploading file: ${value.name}`;
        }
      } else {
        rowData[key] = String(value || "");
      }
    }

    const values = finalHeaders.map((header) => rowData[header] || "");
    await appendToSheet(accessToken, sheetId, [values], sheetInfo.name);

    return new Response(
      JSON.stringify({ message: "Datos enviados correctamente", sheetId, folderId }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error in edge function:", err);
    return new Response(
      JSON.stringify({ error: err.message, details: err.stack }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});