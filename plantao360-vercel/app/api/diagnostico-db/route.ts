
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Não expor diagnósticos em produção.
  if (process.env.VERCEL_ENV !== 'preview') {
    return new NextResponse(null, { status: 404 });
  }

  // Acesso desativado até termos uma proteção
  // administrativa adequada.
  return NextResponse.json(
    { error: 'Diagnóstico protegido' },
    { status: 403 }
  );
}
