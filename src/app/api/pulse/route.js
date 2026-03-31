import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Not auth' }, { status: 401 });

    const sql = getDb();

    // Calculate current day number
    const startDate = new Date(user.start_date);
    startDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const currentDay = Math.floor((now - startDate) / 86400000);

    // Count group members who completed today
    const result = await sql`
      SELECT COUNT(DISTINCT dp.user_id) as done_count
      FROM daily_progress dp
      JOIN users u ON dp.user_id = u.id
      WHERE u.group_id = (SELECT group_id FROM users WHERE id = ${user.id})
      AND dp.day_number = ${currentDay}
      AND dp.status = 'done'
    `;

    const totalResult = await sql`
      SELECT COUNT(*) as total FROM users WHERE group_id = (SELECT group_id FROM users WHERE id = ${user.id})
    `;

    return NextResponse.json({
      done: parseInt(result[0].done_count),
      total: parseInt(totalResult[0].total),
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
