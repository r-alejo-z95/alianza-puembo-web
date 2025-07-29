import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    // Exchange the code for an access token and a refresh token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${url.origin}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await response.json();
    const refresh_token = tokens.refresh_token;

    if (refresh_token) {
      // Securely store the refresh token in your database
      // We use upsert with a fixed ID to ensure only one token is stored
      const { error } = await supabase
        .from('google_integration')
        .upsert({ id: 1, refresh_token: refresh_token })
        .select();

      if (error) {
        console.error('Error saving Google refresh token:', error);
        // Redirect to a page with an error message
        return NextResponse.redirect(new URL('/admin/formularios?error=db_error', url.origin));
      }

      // Redirect to a success page
      return NextResponse.redirect(new URL('/admin/formularios?success=true', url.origin));
    }

    // Handle cases where a refresh token is not returned
    console.error('Google did not return a refresh token.', tokens);
    return NextResponse.redirect(new URL('/admin/formularios?error=no_refresh_token', url.origin));
  }

  // Handle error case from Google's consent screen
  const error = url.searchParams.get('error');
  return NextResponse.redirect(new URL(`/admin/formularios?error=${error || 'unknown'}`, url.origin));
}
