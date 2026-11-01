import {NextResponse} from 'next/server';
export const runtime='nodejs';
// Endpoint reservado: a confirmação automática depende da assinatura autenticada,
// identificação segura da assinatura e proteção contra notificações duplicadas.
// Não registrar pagamento nem liberar acesso sem essas verificações.
export async function POST(){return NextResponse.json({error:'Integração de confirmação ainda não habilitada'},{status:503});}
