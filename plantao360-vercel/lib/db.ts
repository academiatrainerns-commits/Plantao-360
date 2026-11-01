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
    await sql`CREATE TABLE IF NOT EXISTS p360_trials (
      user_id UUID PRIMARY KEY REFERENCES p360_users(id) ON DELETE CASCADE,
      whatsapp TEXT NOT NULL,
      consent_at TIMESTAMPTZ NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS p360_trials_expiry ON p360_trials(expires_at)`;
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
    await sql`CREATE TABLE IF NOT EXISTS p360_contracts (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      institution_id UUID NOT NULL REFERENCES p360_institutions(id) ON DELETE RESTRICT,
      title TEXT NOT NULL, monthly_amount NUMERIC(12,2) NOT NULL,
      weekly_hours NUMERIC(8,2) NOT NULL DEFAULT 0, start_date DATE NOT NULL,
      end_date DATE, notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_workdays (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      contract_id UUID NOT NULL REFERENCES p360_contracts(id) ON DELETE CASCADE,
      work_date DATE NOT NULL, hours NUMERIC(8,2) NOT NULL,
      notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_production (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      institution_id UUID NOT NULL REFERENCES p360_institutions(id) ON DELETE RESTRICT,
      service_date DATE NOT NULL, service_type TEXT NOT NULL, quantity INTEGER NOT NULL,
      unit_amount NUMERIC(12,2) NOT NULL, amount NUMERIC(12,2) NOT NULL,
      paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_contract_receipts (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      contract_id UUID NOT NULL REFERENCES p360_contracts(id) ON DELETE CASCADE,
      reference_month TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL,
      received_on DATE NOT NULL, notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_plans (
      slug TEXT PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL CHECK(price > 0),
      features TEXT NOT NULL DEFAULT '', active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`INSERT INTO p360_plans(slug,name,price,features) VALUES
      ('essencial','Essencial',19.90,'Plantões, locais e painel'),
      ('pro','Pro',34.90,'Jornadas, atendimentos e financeiro'),
      ('premium','Premium',49.90,'Todos os módulos e recursos futuros') ON CONFLICT(slug) DO NOTHING`;
    await sql`CREATE TABLE IF NOT EXISTS p360_subscriptions (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      plan_slug TEXT NOT NULL REFERENCES p360_plans(slug), mp_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending', checkout_url TEXT,
      paid_until TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS p360_sub_one_user ON p360_subscriptions(user_id)`;
    await sql`CREATE TABLE IF NOT EXISTS p360_subscription_payments (
      payment_id TEXT PRIMARY KEY, subscription_id UUID NOT NULL REFERENCES p360_subscriptions(id),
      amount NUMERIC(10,2) NOT NULL, paid_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_billing_audit (
      id UUID PRIMARY KEY, event TEXT NOT NULL, reference TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_expenses (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      institution_id UUID REFERENCES p360_institutions(id) ON DELETE SET NULL,
      spent_on DATE NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      amount NUMERIC(12,2) NOT NULL CHECK(amount >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS p360_agenda (
      id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES p360_users(id) ON DELETE CASCADE,
      institution_id UUID REFERENCES p360_institutions(id) ON DELETE SET NULL,
      title TEXT NOT NULL, starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'previsto', planned_hours NUMERIC(8,2) NOT NULL,
      actual_hours NUMERIC(8,2), notes TEXT NOT NULL DEFAULT '',
      series_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT p360_agenda_positive CHECK (ends_at > starts_at)
    )`;
    await sql`CREATE INDEX IF NOT EXISTS p360_agenda_user_time ON p360_agenda(user_id,starts_at)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_expenses_month ON p360_expenses(user_id,spent_on)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_contracts_user ON p360_contracts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_workdays_month ON p360_workdays(user_id,work_date)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_production_month ON p360_production(user_id,service_date)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_contract_receipts_month ON p360_contract_receipts(user_id,reference_month)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_institutions_user_idx ON p360_institutions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS p360_shifts_user_date_idx ON p360_shifts(user_id,shift_date)`;
  })().catch(e => { ready = undefined; throw e; });
  return ready;
}
