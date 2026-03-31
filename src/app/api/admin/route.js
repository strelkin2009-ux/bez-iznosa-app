import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const ADMIN_PASS = process.env.ADMIN_PASS || 'beziznosa2026';

function checkAuth(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/bi_admin=([^;]+)/);
  return match && match[1] === ADMIN_PASS;
}

// GET /api/admin?action=groups|users|progress&group_id=X
export async function GET(req) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'groups';
  const groupId = searchParams.get('group_id');
  const sql = getDb();

  try {
    if (action === 'groups') {
      const groups = await sql`
        SELECT g.*, 
          (SELECT COUNT(*) FROM users WHERE group_id = g.id) as user_count,
          (SELECT COUNT(DISTINCT dp.user_id) FROM daily_progress dp JOIN users u ON dp.user_id = u.id WHERE u.group_id = g.id AND dp.status = 'done') as active_users
        FROM groups g ORDER BY g.created_at DESC
      `;
      return NextResponse.json({ groups });
    }

    if (action === 'users' && groupId) {
      const users = await sql`
        SELECT u.id, u.name, u.anchor, u.created_at,
          (SELECT COUNT(*) FROM daily_progress WHERE user_id = u.id AND status = 'done') as done_count,
          (SELECT COUNT(*) FROM daily_progress WHERE user_id = u.id AND status = 'quiet') as quiet_count,
          (SELECT MAX(day_number) FROM daily_progress WHERE user_id = u.id AND status = 'done') as last_done_day,
          u.survey_a IS NOT NULL as has_survey_a,
          u.survey_b IS NOT NULL as has_survey_b
        FROM users u WHERE u.group_id = ${groupId} ORDER BY u.name
      `;
      const group = await sql`SELECT * FROM groups WHERE id = ${groupId}`;
      return NextResponse.json({ users, group: group[0] });
    }

    if (action === 'progress' && groupId) {
      const progress = await sql`
        SELECT u.name, dp.day_number, dp.status, dp.checkin_answer
        FROM daily_progress dp
        JOIN users u ON dp.user_id = u.id
        WHERE u.group_id = ${groupId}
        ORDER BY dp.day_number, u.name
      `;
      return NextResponse.json({ progress });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('Admin GET error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin — login or create group
export async function POST(req) {
  const body = await req.json();
  const sql = getDb();

  // Login
  if (body.action === 'login') {
    if (body.password === ADMIN_PASS) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set('bi_admin', ADMIN_PASS, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return res;
    }
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Create group
    if (body.action === 'create_group') {
      const { code, name, start_date } = body;
      if (!code || !name || !start_date) return NextResponse.json({ error: 'Заполни все поля' }, { status: 400 });
      
      const existing = await sql`SELECT id FROM groups WHERE code = ${code.toLowerCase()}`;
      if (existing.length) return NextResponse.json({ error: 'Код уже занят' }, { status: 400 });

      const created = await sql`
        INSERT INTO groups (code, name, start_date) VALUES (${code.toLowerCase()}, ${name}, ${start_date}) RETURNING *
      `;
      return NextResponse.json({ group: created[0] });
    }

    // Update group
    if (body.action === 'update_group') {
      const { id, name, start_date } = body;
      await sql`UPDATE groups SET name = ${name}, start_date = ${start_date} WHERE id = ${id}`;
      return NextResponse.json({ ok: true });
    }

    // Delete group
    if (body.action === 'delete_group') {
      const { id } = body;
      await sql`DELETE FROM daily_progress WHERE user_id IN (SELECT id FROM users WHERE group_id = ${id})`;
      await sql`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE group_id = ${id})`;
      await sql`DELETE FROM users WHERE group_id = ${id}`;
      await sql`DELETE FROM groups WHERE id = ${id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('Admin POST error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
