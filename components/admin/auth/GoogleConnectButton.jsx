import { Button } from '@/components/ui/button';

export default function GoogleConnectButton() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  // This should be the exact URL you registered in the Google Cloud Console
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google` : 'http://localhost:3000/api/auth/callback/google';

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    // The scope should include all permissions your app needs
    scope: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
    // 'offline' is crucial to get a refresh token
    access_type: 'offline',
    // 'consent' ensures the user is prompted, which is good for re-getting a refresh token
    prompt: 'consent',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return (
    <Button asChild variant="green">
      <a href={authUrl}>Conectar con Google</a>
    </Button>
  );
}
