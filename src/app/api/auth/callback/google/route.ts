import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getBaseUrl,
  exchangeGoogleCode,
  signToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = getBaseUrl(request);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      `${baseUrl}/?auth_error=${encodeURIComponent(error || 'no_code')}`
    );
  }

  try {
    const user = await exchangeGoogleCode(code, baseUrl);
    const { upsertUser } = await import('@/lib/db');
    await upsertUser(user);
    const token = signToken(user);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return NextResponse.redirect(`${baseUrl}/?auth_success=1`);
  } catch (err) {
    console.error('Google callback authentication error:', err);
    return NextResponse.redirect(`${baseUrl}/?auth_error=auth_failed`);
  }
}
