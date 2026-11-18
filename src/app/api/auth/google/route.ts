import { NextResponse } from 'next/server';
import { getBaseUrl, getGoogleOAuthUrl } from '@/lib/auth';

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  try {
    const url = getGoogleOAuthUrl(baseUrl);
    return NextResponse.redirect(url);
  } catch (err: unknown) {
    const isNotConfigured = err instanceof Error && err.message === 'GOOGLE_CLIENT_ID_NOT_CONFIGURED';
    const target = isNotConfigured
      ? `${baseUrl}/?auth_error=google_not_configured`
      : `${baseUrl}/?auth_error=unknown`;
    return NextResponse.redirect(target);
  }
}
