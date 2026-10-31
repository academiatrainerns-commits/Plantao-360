import {NextRequest,NextResponse} from 'next/server';
import {getUserId} from '@/lib/auth';
import {initDb,db} from '@/lib/db';
export const runtime='nodejs';
const fail=(m:string,s=400)=>NextResponse.json({error:m},{status:s});
async function authorized(){const id=await getUserId();if(!id)return false;const email=String(process.env.MASTER_EMAIL||'').trim().toLowerCase();if(!email)return false;await initDb();const users=await db()`SELECT id FROM p360_users WHERE id=${id} AND lower(email)=${email}`;return users.length>0;}
export async function GET(){try{if(!await authorized())return fail('Acesso restrito',403);const sql=db();const [users,subs,plans,counts]=await Promise.all([
 sql`SELECT u.id,u.name,u.email,u.created_at,s.plan_slug,s.status,s.paid_until FROM p360_users u LEFT JOIN p360_subscriptions s ON s.user_id=u.id ORDER BY u.created_at DESC LIMIT 100`,
 sql`SELECT s.id,u.name,u.email,s.plan_slug,s.status,s.paid_until,s.created_at FROM p360_subscriptions s JOIN p360_users u ON u.id=s.user_id ORDER BY s.created_at DESC LIMIT 100`,
 sql`SELECT * FROM p360_plans ORDER BY price`,
 sql`SELECT (SELECT COUNT(*)::int FROM p360_users) users,(SELECT COUNT(*)::int FROM p360_subscriptions) subscriptions,(SELECT COUNT(*)::int FROM p360_subscriptions WHERE status='authorized' AND paid_until>now()) paying,(SELECT COALESCE(SUM(p.price),0)::float FROM p360_subscriptions s JOIN p360_plans p ON p.slug=s.plan_slug WHERE s.status='authorized' AND s.paid_until>now()) mrr`]);
 return NextResponse.json({users,subscriptions:subs,plans,stats:counts[0]});
 }catch{return fail('Erro no painel',500)}}
export async function PATCH(req:NextRequest){try{if(!await authorized())return fail('Acesso restrito',403);const b=await req.json();const slug=String(b.slug||'');const price=Number(b.price);const name=String(b.name||'').trim();if(!['essencial','pro','premium'].includes(slug)||!name||name.length>80||!Number.isFinite(price)||price<1||price>10000)return fail('Dados inválidos');await db()`UPDATE p360_plans SET name=${name},price=${Math.round(price*100)/100},active=${b.active===true} WHERE slug=${slug}`;return NextResponse.json({ok:true});}catch{return fail('Não foi possível atualizar o plano',500)}}
