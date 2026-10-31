import { NextRequest,NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { initDb,db } from '@/lib/db';
import { mp,syncSubscription,audit } from '@/lib/billing';
import { randomUUID } from 'crypto';
export const runtime='nodejs';
const failure=(message:string,status=400)=>NextResponse.json({error:message},{status});
export async function GET(){try{const user=await getUserId();if(!user)return failure('Faça login',401);await initDb();const sql=db();const plans=await sql`SELECT slug,name,price,features FROM p360_plans WHERE active=true ORDER BY price`;
 const subs=await sql`SELECT id,plan_slug,mp_id,status,paid_until,checkout_url FROM p360_subscriptions WHERE user_id=${user} LIMIT 1`;
 return NextResponse.json({plans,subscription:subs[0]||null,active:subs.length>0&&subs[0].status==='authorized'&&!!subs[0].paid_until&&new Date(subs[0].paid_until)>new Date()});
 }catch{return failure('Falha ao consultar assinaturas',500)}}
export async function POST(req:NextRequest){try{const user=await getUserId();if(!user)return failure('Faça login',401);await initDb();const sql=db();const body=await req.json();const action=String(body.action||'create');
 if(action==='sync'){
 const subs=await sql`SELECT mp_id FROM p360_subscriptions WHERE user_id=${user} AND mp_id IS NOT NULL`;
 if(subs.length)await syncSubscription(String(subs[0].mp_id));return NextResponse.json({ok:true});}
 if(action==='cancel'){
 const subs=await sql`SELECT mp_id FROM p360_subscriptions WHERE user_id=${user} AND mp_id IS NOT NULL`;
 if(!subs.length)return failure('Assinatura inexistente');
 await mp('/preapproval/'+encodeURIComponent(String(subs[0].mp_id)),{method:'PUT',body:JSON.stringify({status:'canceled'})});await syncSubscription(String(subs[0].mp_id));return NextResponse.json({ok:true});}
 if(action!=='create')return failure('Ação inválida');
 const slug=String(body.plan||'');const plans=await sql`SELECT slug,name,price FROM p360_plans WHERE slug=${slug} AND active=true`;
 if(!plans.length)return failure('Plano não encontrado');
 const existing=await sql`SELECT id,mp_id,status,checkout_url FROM p360_subscriptions WHERE user_id=${user}`;
 if(existing.length && existing[0].mp_id && !['canceled','cancelled'].includes(String(existing[0].status)))return failure('Já existe uma assinatura. Atualize a situação ou cancele antes de criar outra.');
 const users=await sql`SELECT email FROM p360_users WHERE id=${user}`;
 if(!users.length)return failure('Usuário não encontrado',401);
 const appUrl=process.env.NEXT_PUBLIC_APP_URL;
 if(!appUrl||!/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?$/i.test(appUrl))return failure('Configure NEXT_PUBLIC_APP_URL com o endereço HTTPS do site.',503);
 const subId=existing.length?String(existing[0].id):randomUUID();
 const data=await mp('/preapproval',{method:'POST',headers:{'X-Idempotency-Key':subId+'-'+slug+'-'+Date.now()},body:JSON.stringify({reason:'Plantão360 '+plans[0].name,external_reference:subId,payer_email:users[0].email,auto_recurring:{frequency:1,frequency_type:'months',transaction_amount:Number(plans[0].price),currency_id:'BRL'},back_url:appUrl+'/assinatura',status:'pending'})});
 if(!data.id||!data.init_point)throw new Error('Mercado Pago não retornou link de assinatura');
 if(existing.length)await sql`UPDATE p360_subscriptions SET plan_slug=${slug},mp_id=${String(data.id)},status='pending',checkout_url=${String(data.init_point)},paid_until=NULL,updated_at=now() WHERE user_id=${user}`;
 else await sql`INSERT INTO p360_subscriptions(id,user_id,plan_slug,mp_id,status,checkout_url) VALUES(${subId},${user},${slug},${String(data.id)},'pending',${String(data.init_point)})`;
 await audit('subscription.created',subId);
 return NextResponse.json({url:data.init_point});
 }catch(e){return failure(e instanceof Error?e.message:'Erro inesperado',500)}}
