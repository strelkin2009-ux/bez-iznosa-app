import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
    const sql = getDb();
    const groupId = (await sql`SELECT group_id FROM users WHERE id = ${user.id}`)[0]?.group_id;
    if (!groupId) return NextResponse.json({ message: null });
    const msgs = await sql`
      SELECT id, message, created_at FROM group_messages
      WHERE group_id = ${groupId}
      ORDER BY created_at DESC LIMIT 1
    `;
    return NextResponse.json({ message: msgs[0] || null });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST = dismiss (we just return ok, frontend handles hiding)
export async function POST(req) {
  return NextResponse.json({ ok: true });
}
