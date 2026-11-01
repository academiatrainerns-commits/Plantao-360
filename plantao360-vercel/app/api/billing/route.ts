import {NextRequest, NextResponse} from 'next/server';
import {getUserId} from '@/lib/auth';
import {db,initDb} from '@/lib/db';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const providers=['hotmart','kiwify'] as const;
const slugs=['essencial','pro','premium'];
function checkout(provider:string,slug:string){
 if(!providers.includes(provider as typeof providers[number])||!slugs.includes(slug)) return null;
 const key=`${provider.toUpperCase()}_CHECKOUT_${slug.toUpperCase()}`;
 const value=process.env[key];
 if(!value)return null;
 try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password)return null;return url.toString()}catch{return null}
}
export async function GET(){
 try{const user=await getUserId();if(!user)return fail('Faça login',401);
 await initDb();const sql=db();const plans=await sql`SELECT slug,name,price,features FROM p360_plans WHERE active=true ORDER BY price`;
 const subscriptions=await sql`SELECT id,plan_slug,status,paid_until,checkout_url,mp_id FROM p360_subscriptions WHERE user_id=${user} LIMIT 1`;
 const sub=subscriptions[0]||null;
 const trials=await sql`SELECT expires_at FROM p360_trials WHERE user_id=${user} LIMIT 1`;
 const links=Object.fromEntries(plans.map(p=>[p.slug,Object.fromEntries(providers.map(provider=>[provider,Boolean(checkout(provider,String(p.slug)))]))]));
 return NextResponse.json({plans,subscription:sub,trialUntil:trials[0]?.expires_at||null,providers:links,active:!!sub&&sub.status==='authorized'&&!!sub.paid_until&&new Date(sub.paid_until)>new Date()});
 }catch{return fail('Erro ao consultar assinaturas',500)}
}
export async function POST(req:NextRequest){
 try{const user=await getUserId();if(!user)return fail('Faça login',401);
 const b=await req.json();if(b.action!=='checkout')return fail('Ação não disponível. Gerencie cancelamentos na plataforma onde assinou.');
 const provider=String(b.provider||'').toLowerCase(),slug=String(b.plan||'').toLowerCase();
 if(!providers.includes(provider as typeof providers[number])||!slugs.includes(slug))return fail('Plano ou plataforma inválidos');
 await initDb();const sql=db();const plans=await sql`SELECT slug FROM p360_plans WHERE slug=${slug} AND active=true`;
 if(!plans.length)return fail('Plano indisponível');
 const existing=await sql`SELECT status,paid_until FROM p360_subscriptions WHERE user_id=${user} LIMIT 1`;
 if(existing.length&&existing[0].status==='authorized'&&existing[0].paid_until&&new Date(existing[0].paid_until)>new Date())return fail('Já existe assinatura ativa. Confira antes de contratar outra.');
 const url=checkout(provider,slug);if(!url)return fail('Checkout ainda não configurado para este plano nesta plataforma.',503);
 // Apenas direciona ao checkout oficial. Não ativa assinatura sem verificação.
 return NextResponse.json({url});
 }catch{return fail('Erro ao iniciar contratação',500)}
}
