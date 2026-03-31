import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not auth' }, { status: 401 });

    const sql = getDb();
    const progress = await sql`SELECT day_number, status, checkin_answer FROM daily_progress WHERE user_id = ${user.id} ORDER BY day_number`;

    const completedDays = {};
    const quietDays = {};
    const checkinAnswers = {};

    for (const row of progress) {
      if (row.status === 'done') {
        completedDays[row.day_number] = true;
        if (row.checkin_answer) checkinAnswers[row.day_number] = row.checkin_answer;
      } else if (row.status === 'quiet') {
        quietDays[row.day_number] = true;
      }
    }

    return NextResponse.json({ completedDays, quietDays, checkinAnswers });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not auth' }, { status: 401 });

    const { day_number, status, checkin_answer } = await req.json();

    // Validate day number matches today
    const startDate = new Date(user.start_date);
    startDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const currentDay = Math.floor((now - startDate) / 86400000);

    if (day_number !== currentDay) {
      return NextResponse.json({ error: 'Can only mark today' }, { status: 400 });
    }
    if (day_number < 0 || day_number >= 42) {
      return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO daily_progress (user_id, day_number, status, checkin_answer)
      VALUES (${user.id}, ${day_number}, ${status || 'done'}, ${checkin_answer || null})
      ON CONFLICT (user_id, day_number) DO UPDATE SET status = ${status || 'done'}, checkin_answer = ${checkin_answer || null}
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Progress error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
