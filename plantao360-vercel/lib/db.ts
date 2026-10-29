import { neon } from '@neondatabase/serverless';

export function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('Banco não configurado: conecte Neon na Vercel.');
  return neon(url);
}

let ready: Promise<void> | undefined;
export function initDb(): Promise<void> {
  if (!ready) ready = (async () => {
    const sql = db();
    await sql`CREATE TABLE IF NOT EXISTS p360_users (
      id UUID PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_institutions (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'Hospital', city TEXT NOT NULL DEFAULT '',
      rate NUMERIC(12,2) NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_shifts (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      institution_id UUID NOT NULL REFERENCES p360_institutions(id) ON DELETE CASCADE,
      shift_date DATE NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
      hours NUMERIC(8,2) NOT NULL, rate NUMERIC(12,2) NOT NULL,
      amount NUMERIC(12,2) NOT NULL, status TEXT NOT NULL DEFAULT 'Concluído',
      paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS p360_institutions_user_idx ON p360_institutions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_shifts_user_date_idx ON p360_shifts(user_id,shift_date)`;
  })().catch(e => { ready = undefined; throw e; });
  return ready;
}
