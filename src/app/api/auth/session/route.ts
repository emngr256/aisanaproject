import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifyToken, AuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }
    const user = verifyToken<AuthUser>(token);
    return NextResponse.json({ user: user ?? null });
  } catch (err) {
    console.error('Session retrieval error:', err);
    return NextResponse.json({ user: null });
  }
}
