import { neon } from '@neondatabase/serverless';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('Set DATABASE_URL'); process.exit(1); }
const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('Migrating v2...');

  // Messages from leader to group
  await sql`
    CREATE TABLE IF NOT EXISTS group_messages (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES groups(id),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Weekly reflections from participants
  await sql`
    CREATE TABLE IF NOT EXISTS weekly_reflections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      week_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, week_number)
    )
  `;

  // Telegram chat_id for notifications
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(100)`;
  } catch(e) { console.log('telegram_id column may already exist'); }

  console.log('Migration v2 done!');
}

migrate().catch(console.error);
