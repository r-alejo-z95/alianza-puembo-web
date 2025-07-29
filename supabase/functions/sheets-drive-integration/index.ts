import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT } from "https://deno.land/x/jose@v4.14.4/index.ts";

// Usar las APIs nativas de Deno en lugar de bibliotecas externas para Google APIs
interface GoogleCredentials {
  client_email: string;
  private_key: string;
}

// Helper function to get Google credentials from environment variables
function getGoogleCredentials(): GoogleCredentials {
  const email = Deno.env.get("GOOGLE_CLIENT_EMAIL");
  const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");

  if (!email || !privateKey) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY");
  }

  return {
    client_email: email,
    private_key: privateKey.replace(/\\n/g, '\n'), // Fix escaped newlines
  };
}

// Function to convert PEM to DER format
function pemToDer(pem: string): Uint8Array {
  // Remove PEM headers and whitespace
  const base64 = pem
    .replace(/-----BEGIN[^-]+-----/g, '')
    .replace(/-----END[^-]+-----/g, '')
    .replace(/\s/g, '');
  
  // Convert base64 to binary
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Function to get Google OAuth token using jose library
async function getGoogleAccessToken(credentials: GoogleCredentials): Promise<string> {
  const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets";
  
  const now = Math.floor(Date.now() / 1000);
  
  try {
    // Convert PEM to CryptoKey
    const privateKeyDer = pemToDer(credentials.private_key);
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );
    
    // Create JWT using jose
    const jwt = await new SignJWT({
      iss: credentials.client_email,
      scope: scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    })
      .setProtectedHeader({ alg: "RS256" })
      .sign(privateKey);
    
    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Token response error:", tokenData);
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
    }
    
    console.log("Successfully obtained access token");
    return tokenData.access_token;
  } catch (error) {
    console.error("Error in getGoogleAccessToken:", error);
    throw error;
  }
}

// Google API helper functions
async function createDriveFolder(accessToken: string, name: string): Promise<string> {
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
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${JSON.stringify(data)}`);
  }
  
  return data.id;
}

async function createGoogleSheet(accessToken: string, title: string): Promise<string> {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title: title },
    }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to create sheet: ${JSON.stringify(data)}`);
  }
  
  return data.spreadsheetId;
}

async function appendToSheet(accessToken: string, spreadsheetId: string, values: string[][]): Promise<void> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:Z:append?valueInputOption=RAW`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: values,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to append to sheet: ${JSON.stringify(error)}`);
  }
}

async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  fileData: Uint8Array,
  mimeType: string
): Promise<string> {
  // First, create the file metadata
  const metadataResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: fileName,
      parents: [folderId],
    }),
  });
  
  if (!metadataResponse.ok) {
    throw new Error(`Failed to initiate file upload: ${metadataResponse.statusText}`);
  }
  
  const uploadUrl = metadataResponse.headers.get("location");
  if (!uploadUrl) {
    throw new Error("No upload URL received");
  }
  
  // Upload the file data
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: fileData,
  });
  
  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }
  
  const fileData_result = await uploadResponse.json();
  return fileData_result.webViewLink || `File uploaded: ${fileName}`;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { 
        auth: { 
          persistSession: false 
        }
      }
    );

    // Fetch form details from Supabase
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

    let { google_sheet_id: sheetId, google_drive_folder_id: folderId } = form;

    // Get Google credentials and access token
    const credentials = getGoogleCredentials();
    const accessToken = await getGoogleAccessToken(credentials);

    const headers = Object.keys(formData);

    // Create Drive folder and Google Sheet if they don't exist
    if (!sheetId || !folderId) {
      // Create Drive Folder
      folderId = await createDriveFolder(accessToken, `Respuestas Formulario - ${form.title}`);
      
      // Create Google Sheet
      sheetId = await createGoogleSheet(accessToken, `Respuestas Formulario - ${form.title}`);

      // Update Supabase with the new IDs
      const { error: updateError } = await supabase
        .from("forms")
        .update({
          google_sheet_id: sheetId,
          google_drive_folder_id: folderId,
        })
        .eq("id", formId);

      if (updateError) {
        console.error("Error updating form:", updateError);
      }

      // Add headers to the new sheet
      await appendToSheet(accessToken, sheetId, [headers]);
    }

    // Process and upload form data
    const rowData: Record<string, string> = {};
    
    for (const key in formData) {
      const value = formData[key];
      
      if (typeof value === "object" && value?.type === "file" && value.name && value.data) {
        try {
          // Handle file upload
          const base64Data = value.data.includes(',') ? value.data.split(',')[1] : value.data;
          const mimeType = value.data.match(/data:(.*?);base64,/)?.[1] || "application/octet-stream";
          
          // Decode base64 to binary
          const binaryString = atob(base64Data);
          const binaryData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            binaryData[i] = binaryString.charCodeAt(i);
          }

          const fileUrl = await uploadFileToDrive(
            accessToken,
            folderId!,
            value.name,
            binaryData,
            mimeType
          );
          
          rowData[key] = fileUrl;
        } catch (fileError) {
          console.error(`Error uploading file ${value.name}:`, fileError);
          rowData[key] = `Error uploading file: ${value.name}`;
        }
      } else {
        rowData[key] = String(value || "");
      }
    }

    // Create the row data in the same order as headers
    const values = headers.map((header) => rowData[header] || "");

    // Append the new row to the sheet
    await appendToSheet(accessToken, sheetId, [values]);

    return new Response(
      JSON.stringify({ 
        message: "Datos enviados correctamente",
        sheetId: sheetId,
        folderId: folderId
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Error in edge function:", err);
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : "Internal server error",
        details: err instanceof Error ? err.stack : undefined
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});