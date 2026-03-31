import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth';

export async function PATCH(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not auth' }, { status: 401 });

    const body = await req.json();
    const sql = getDb();

    if (body.anchor !== undefined) {
      await sql`UPDATE users SET anchor = ${body.anchor} WHERE id = ${user.id}`;
    }
    if (body.letter !== undefined) {
      await sql`UPDATE users SET letter = ${body.letter} WHERE id = ${user.id}`;
    }
    if (body.survey_a !== undefined) {
      await sql`UPDATE users SET survey_a = ${JSON.stringify(body.survey_a)} WHERE id = ${user.id}`;
    }
    if (body.survey_b !== undefined) {
      await sql`UPDATE users SET survey_b = ${JSON.stringify(body.survey_b)} WHERE id = ${user.id}`;
    }
    if (body.compare_viewed !== undefined) {
      await sql`UPDATE users SET compare_viewed = ${body.compare_viewed} WHERE id = ${user.id}`;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Profile error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
