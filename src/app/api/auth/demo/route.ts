import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  signToken,
  AuthUser,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<AuthUser>;
    const user: AuthUser = {
      id: body.id || 'demo-google-user',
      name: body.name || 'Google Студент',
      email: body.email || 'student.google@aisana.me',
      picture: body.picture,
    };
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
    return NextResponse.json({ user });
  } catch (err) {
    console.error('Demo auth error:', err);
    return NextResponse.json({ error: 'Failed to create demo session' }, { status: 500 });
  }
}
