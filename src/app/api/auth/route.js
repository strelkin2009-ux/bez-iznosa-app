import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createSession, getUserFromToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, code } = await req.json();
    if (!name || !code) return NextResponse.json({ error: 'name and code required' }, { status: 400 });

    const sql = getDb();
    const groups = await sql`SELECT * FROM groups WHERE code = ${code.toLowerCase()}`;
    if (!groups.length) return NextResponse.json({ error: 'Неверный код группы' }, { status: 404 });

    const group = groups[0];
    let users = await sql`SELECT * FROM users WHERE name = ${name} AND group_id = ${group.id}`;
    let user;

    if (users.length) {
      user = users[0];
    } else {
      const created = await sql`INSERT INTO users (name, group_id) VALUES (${name}, ${group.id}) RETURNING *`;
      user = created[0];
    }

    const token = await createSession(user.id);

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        anchor: user.anchor,
        letter: user.letter,
        survey_a: user.survey_a,
        survey_b: user.survey_b,
        compare_viewed: user.compare_viewed,
        onboarded: !!user.anchor,
        letterDone: user.letter !== null,
      },
      group: {
        code: group.code,
        name: group.name,
        start_date: group.start_date,
      },
    });

    res.cookies.set('bi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (e) {
    console.error('Auth error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        anchor: user.anchor,
        letter: user.letter,
        survey_a: user.survey_a,
        survey_b: user.survey_b,
        compare_viewed: user.compare_viewed,
        onboarded: !!user.anchor,
        letterDone: user.letter !== null,
      },
      group: {
        code: user.group_code,
        name: user.group_name,
        start_date: user.start_date,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const token = getTokenFromRequest(req);
  if (token) {
    const sql = getDb();
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('bi_token', '', { maxAge: 0, path: '/' });
  return res;
}
