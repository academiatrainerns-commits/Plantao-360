import {NextRequest,NextResponse} from 'next/server';
import {verifyWebhook,syncSubscription,audit,mp} from '@/lib/billing';
import {initDb} from '@/lib/db';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 try{
 const id=req.nextUrl.searchParams.get('data.id');
 if(!verifyWebhook(req.headers.get('x-signature'),req.headers.get('x-request-id'),id))return NextResponse.json({error:'Assinatura inválida'},{status:401});
 const body=await req.json(); const type=String(body.type||req.nextUrl.searchParams.get('type')||'');
 await initDb();
 if(type==='subscription_preapproval'&&id)await syncSubscription(id);
 else if(type==='subscription_authorized_payment'&&id){const record=await mp('/authorized_payments/'+encodeURIComponent(id));if(record.preapproval_id)await syncSubscription(String(record.preapproval_id));}
 else if(type==='payment'&&id){const invoice=await mp('/authorized_payments/search?payment_id='+encodeURIComponent(id));for(const row of (invoice.results||[]))if(row.preapproval_id)await syncSubscription(String(row.preapproval_id));}
 await audit('webhook.'+type,(id||'').slice(0,120));return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Falha ao processar evento'},{status:500})}
}
