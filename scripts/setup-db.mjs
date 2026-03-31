import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Set DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setup() {
  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS groups (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      start_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      group_id INTEGER REFERENCES groups(id),
      pin_hash VARCHAR(200),
      anchor TEXT,
      letter TEXT,
      survey_a JSONB,
      survey_b JSONB,
      compare_viewed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(name, group_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      day_number INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'done',
      checkin_answer TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, day_number)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      token VARCHAR(200) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('Tables created!');

  // Create a demo group
  await sql`
    INSERT INTO groups (code, name, start_date)
    VALUES ('demo', 'Демо-группа', CURRENT_DATE)
    ON CONFLICT (code) DO NOTHING
  `;

  console.log('Demo group "demo" created.');
  console.log('Done!');
}

setup().catch(console.error);
