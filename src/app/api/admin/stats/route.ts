import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifyToken, isUserAdmin, AuthUser } from '@/lib/auth';
import { getAdminStats } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken<AuthUser>(token);
    if (!user || !isUserAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stats = await getAdminStats();
    return NextResponse.json({
      ok: true,
      stats,
      system: {
        nodeVersion: process.version,
        isRender: process.env.RENDER === 'true',
        hasRustApi: !!process.env.RUST_API_URL,
        hasGoogleAuth: !!process.env.GOOGLE_CLIENT_ID,
      },
    });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
