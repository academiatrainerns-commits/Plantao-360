import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { getUserId, setSession, endSession } from '@/lib/auth';
import { hash, compare } from 'bcryptjs';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
const fail = (message:string, status=400) => NextResponse.json({error:message},{status});
export async function GET(_:NextRequest, context:{params:Promise<{action:string}>}) {
 try {
  const {action} = await context.params;
  if (action !== 'me') return fail('Rota inválida',404);
  const id = await getUserId(); if (!id) return fail('Não autenticado',401);
  await initDb(); const users = await db()`SELECT id,name,email FROM p360_users WHERE id=${id}`;
  if (!users.length) return fail('Não autenticado',401);
  return NextResponse.json({user:users[0]});
 } catch(e) { return fail(e instanceof Error ? e.message : 'Erro interno',500); }
}
export async function POST(req:NextRequest,context:{params:Promise<{action:string}>}) {
 try {
  const {action}=await context.params;
  if (action==='logout') {await endSession();return NextResponse.json({ok:true});}
  if (!['login','register'].includes(action)) return fail('Rota inválida',404);
  const body=await req.json();
  const email=String(body.email||'').trim().toLowerCase(); const password=String(body.password||'');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8) return fail('Informe e-mail válido e senha com ao menos 8 caracteres');
  await initDb(); const sql=db();
  if(action==='register') {
    const name=String(body.name||'').trim(); if(name.length<2||name.length>120) return fail('Informe seu nome');
    const whatsapp=String(body.whatsapp||'').replace(/\D/g,'');
    if(!/^\d{10,13}$/.test(whatsapp)) return fail('Informe um WhatsApp válido com DDD');
    if(body.acceptedPrivacy!==true) return fail('É necessário aceitar os termos e a política de privacidade');
    const exists=await sql`SELECT id FROM p360_users WHERE email=${email}`; if(exists.length) return fail('Este e-mail já está cadastrado',409);
    const id=randomUUID(); const passwordHash=await hash(password,12);
    try { await sql`INSERT INTO p360_users(id,name,email,password_hash) VALUES(${id},${name},${email},${passwordHash})`; }
    catch(e) {if(String(e).includes('unique')) return fail('Este e-mail já está cadastrado',409); throw e;}
    await sql`INSERT INTO p360_trials(user_id,whatsapp,consent_at) VALUES(${id},${whatsapp},now())`;
    await setSession(id);return NextResponse.json({user:{id,name,email}});
  }
  const users=await sql`SELECT id,name,email,password_hash FROM p360_users WHERE email=${email}`;
  if(!users.length || !(await compare(password,users[0].password_hash as string))) return fail('E-mail ou senha incorretos',401);
  await setSession(users[0].id as string);
  return NextResponse.json({user:{id:users[0].id,name:users[0].name,email:users[0].email}});
 }catch(e){return fail(e instanceof Error?e.message:'Erro interno',500);}
}
