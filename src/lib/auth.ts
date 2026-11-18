import crypto from 'node:crypto';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isAdmin?: boolean;
}

export const ADMIN_EMAILS = [
  'alan27945@gmail.com',
  ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.toLowerCase().trim()] : []),
];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const SESSION_COOKIE_NAME = 'aisana_session';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

const DEFAULT_SECRET = 'aisana-auth-secret-change-in-production-env';

function getSecret(): string {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

export function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken<T>(token: string): T | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  if (!data || !signature) return null;

  try {
    const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
    if (signature.length !== expected.length) return null;
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const json = Buffer.from(data, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as T;
    if (parsed && typeof parsed === 'object' && 'email' in parsed) {
      const email = (parsed as unknown as { email?: string }).email;
      (parsed as unknown as { isAdmin: boolean }).isAdmin = isUserAdmin(email);
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function getGoogleOAuthUrl(baseUrl: string, state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID_NOT_CONFIGURED');
  }
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    ...(state ? { state } : {}),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, baseUrl: string): Promise<AuthUser> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_AUTH_NOT_CONFIGURED');
  }
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${errText}`);
  }

  const tokenData = await tokenRes.json();
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error('Failed to fetch user profile from Google');
  }

  const profile = await userRes.json();
  const email = profile.email || '';
  return {
    id: profile.sub,
    name: profile.name || profile.given_name || 'Google User',
    email,
    picture: profile.picture,
    isAdmin: isUserAdmin(email),
  };
}
