import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
