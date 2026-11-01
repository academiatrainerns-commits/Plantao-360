
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (
    process.env.VERCEL_ENV !== 'preview' ||
    process.env.VERCEL_GIT_COMMIT_REF !== 'versao-3-3'
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const userId = await getUserId();
  const adminId = process.env.DIAGNOSTIC_ADMIN_USER_ID;

  if (!userId || !adminId || userId !== adminId) {
    return NextResponse.json(
      { error: 'Acesso negado' },
      { status: 403 }
    );
  }

  try {
    const sql = db();
    const rows = await sql`
      SELECT current_setting('neon.branch_id', true) AS branch_id
    `;

    return NextResponse.json({
      branch_id: rows[0]?.branch_id ?? null
    });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao verificar banco' },
      { status: 500 }
    );
  }
}
