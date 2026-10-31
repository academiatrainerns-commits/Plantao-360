import { db, initDb } from '@/lib/db';
import { randomUUID, createHmac, timingSafeEqual } from 'crypto';
export async function mp(path:string, options:RequestInit={}) {
 const token=process.env.MP_ACCESS_TOKEN;
 if(!token) throw new Error('Configure MP_ACCESS_TOKEN na Vercel.');
 const response=await fetch('https://api.mercadopago.com'+path,{...options,headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json',...(options.headers||{})},cache:'no-store'});
 const data=await response.json();
 if(!response.ok) throw new Error('Mercado Pago: '+(data.message||'falha na operação'));
 return data;
}
export async function syncSubscription(mpId:string) {
 await initDb(); const sql=db();
 const rows=await sql`SELECT s.*,p.price FROM p360_subscriptions s JOIN p360_plans p ON p.slug=s.plan_slug WHERE mp_id=${mpId}`;
 if(!rows.length) return false;
 const sub=rows[0]; const remote=await mp('/preapproval/'+encodeURIComponent(mpId));
 if(String(remote.id)!==mpId || String(remote.external_reference)!==String(sub.id)) return false;
 const records=await mp('/authorized_payments/search?preapproval_id='+encodeURIComponent(mpId)+'&limit=50');
 const results=Array.isArray(records.results)?records.results:[];
 for(const invoice of results){
   if(String(invoice.preapproval_id)!==mpId || String(invoice.payment?.status)!=='approved' || !invoice.payment?.id) continue;
   const payment=await mp('/v1/payments/'+encodeURIComponent(String(invoice.payment.id)));
   if(payment.status!=='approved' || Number(payment.transaction_amount)+0.001<Number(sub.price) || String(payment.currency_id)!=='BRL') continue;
   if(String(payment.id)!==String(invoice.payment.id))continue;
   const when=payment.date_approved||payment.date_created;
   if(!when||isNaN(Date.parse(when)))continue;
   await sql`INSERT INTO p360_subscription_payments(payment_id,subscription_id,amount,paid_at) VALUES(${String(payment.id)},${sub.id},${Number(payment.transaction_amount)},${when}) ON CONFLICT(payment_id) DO NOTHING`;
 }
 const payments=await sql`SELECT paid_at FROM p360_subscription_payments WHERE subscription_id=${sub.id} ORDER BY paid_at ASC`;
 let until:Date|null=null;
 for(const pay of payments){const date=new Date(pay.paid_at); if(!until||date>until)until=date;until=new Date(Date.UTC(until.getUTCFullYear(),until.getUTCMonth()+1,until.getUTCDate(),until.getUTCHours(),until.getUTCMinutes(),until.getUTCSeconds()));}
 const status=String(remote.status||'pending');
 await sql`UPDATE p360_subscriptions SET status=${status},paid_until=${until?.toISOString()||null},updated_at=now() WHERE id=${sub.id}`;
 return true;
}
export function verifyWebhook(sig:string|null,requestId:string|null,id:string|null){
 const secret=process.env.MP_WEBHOOK_SECRET;
 if(!secret||!sig||!requestId||!id)return false;
 const ts=/\bts=([0-9]+)\b/.exec(sig)?.[1],v1=/\bv1=([a-f0-9]+)\b/i.exec(sig)?.[1];
 if(!ts||!v1||Math.abs(Date.now()-Number(ts)*1000)>300000)return false;
 const manifest=`id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`;
 const expected=createHmac('sha256',secret).update(manifest).digest('hex');
 const a=Buffer.from(expected,'hex'),b=Buffer.from(v1,'hex');return a.length===b.length&&timingSafeEqual(a,b);
}
export async function audit(event:string,reference=''){await db()`INSERT INTO p360_billing_audit(id,event,reference) VALUES(${randomUUID()},${event},${reference})`;}
