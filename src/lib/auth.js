import { getDb } from './db';
import crypto from 'crypto';

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId) {
  const sql = getDb();
  const token = generateToken();
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  await sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${userId}, ${token}, ${expires})`;
  return token;
}

export async function getUserFromToken(token) {
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.*, g.code as group_code, g.start_date, g.name as group_name
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    JOIN groups g ON u.group_id = g.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows[0] || null;
}

export function getTokenFromRequest(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/bi_token=([^;]+)/);
  return match ? match[1] : null;
}
