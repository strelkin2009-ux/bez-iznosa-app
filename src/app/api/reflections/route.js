import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
    const sql = getDb();
    const rows = await sql`SELECT week_number, text, created_at FROM weekly_reflections WHERE user_id = ${user.id} ORDER BY week_number`;
    const reflections = {};
    for (const r of rows) reflections[r.week_number] = r.text;
    return NextResponse.json({ reflections });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not auth' }, { status: 401 });
    const { week_number, text } = await req.json();
    if (week_number < 0 || week_number > 5 || !text) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    const sql = getDb();
    await sql`
      INSERT INTO weekly_reflections (user_id, week_number, text) VALUES (${user.id}, ${week_number}, ${text})
      ON CONFLICT (user_id, week_number) DO UPDATE SET text = ${text}
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
