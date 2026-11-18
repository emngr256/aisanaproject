import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifyToken, AuthUser } from '@/lib/auth';
import { getUserEntries, saveUserEntry, deleteUserEntry } from '@/lib/db';
import { entrySchema } from '@/lib/analysis';

async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken<AuthUser>(token);
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ entries: [], source: 'guest' });
  }

  const entries = await getUserEntries(user.id);
  return NextResponse.json({ entries, source: 'database' });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: true, source: 'guest' });
  }

  try {
    const body = await request.json();
    const parsed = entrySchema.safeParse(body.entry || body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid entry payload' }, { status: 400 });
    }

    await saveUserEntry(user.id, parsed.data);
    return NextResponse.json({ ok: true, source: 'database' });
  } catch (err) {
    console.error('Failed to save entry to database:', err);
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing entry ID' }, { status: 400 });
  }

  await deleteUserEntry(user.id, id);
  return NextResponse.json({ ok: true, source: 'database' });
}
