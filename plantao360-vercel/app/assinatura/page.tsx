'use client';
import {useEffect,useState} from 'react';

type Plan={slug:string,name:string,price:number,features:string};
type Billing={plans:Plan[],subscription:any,active:boolean};
const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
export default function Page(){
 const [data,setData]=useState<Billing|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function refresh(){const response=await fetch('/api/billing',{cache:'no-store'});const payload=await response.json();if(!response.ok)throw Error(payload.error||'Não foi possível carregar assinaturas');setData(payload)}
 useEffect(()=>{refresh().catch((e:Error)=>setError(e.message))},[]);
 async function act(body:any){setBusy(true);setError('');try{const response=await fetch('/api/billing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const payload=await response.json();if(!response.ok)throw Error(payload.error||'Não foi possível concluir');if(payload.url){window.location.assign(payload.url);return}await refresh()}catch(e:any){setError(e.message||'Erro na operação')}finally{setBusy(false)}}
 return <main className="p360AdminPage"><div className="p360AdminShell"><header className="p360AdminHeader"><a href="/" className="p360Back">← Voltar ao aplicativo</a><div className="p360BrandMark"><span className="p360Pulse">✳</span> Plantão<span>360</span></div></header>
  <section className="p360Hero"><div><span className="p360Eyebrow">MINHA CONTA</span><h1>Minha assinatura</h1><p>Escolha o plano que combina com sua rotina e acompanhe sua situação.</p></div><span className="p360HeroIcon" aria-hidden="true">♧</span></section>
  {error&&<div className="p360Notice p360NoticeError" role="alert">{error}</div>}
  {!data&&!error&&<p className="p360Loading">Carregando planos...</p>}
  {data&&<><div className="p360SubscriptionStatus"><div><span className="p360Eyebrow">SITUAÇÃO ATUAL</span><strong>{data.active?'Pagamento confirmado e acesso ativo':data.subscription?.status||'Sem assinatura ativa'}</strong>{data.subscription?.paid_until&&<small>Válida até {new Date(data.subscription.paid_until).toLocaleDateString('pt-BR')}</small>}</div><span aria-hidden="true">●</span></div>
   <section className="p360Section"><div className="p360SectionHeading"><div><span className="p360Eyebrow">PLANOS</span><h2>Escolha sua assinatura</h2><p>Valores mensais exibidos para comparação.</p></div></div><div className="p360Plans">{data.plans.map(p=><article className="p360Plan p360SalesPlan" key={p.slug}><div className="p360PlanTop"><div><span className="p360PlanSlug">{p.slug}</span><h3>{p.name}</h3></div></div><div className="p360Price">{money(Number(p.price))}<small>/mês</small></div><p>{p.features}</p><button className="p360Button" disabled={busy||!!data.subscription?.mp_id&&!['canceled','cancelled'].includes(data.subscription.status)} onClick={()=>act({plan:p.slug})}>{busy?'Aguarde...':'Escolher plano'}</button></article>)}</div></section>
   <div className="p360Actions"><button className="p360Button p360ButtonOutline" disabled={busy} onClick={()=>act({action:'sync'})}>Conferir pagamento</button>{data.subscription?.checkout_url&&data.subscription.status==='pending'&&<a className="p360Button" href={data.subscription.checkout_url} target="_blank" rel="noopener noreferrer">Continuar pagamento</a>}{data.subscription?.mp_id&&!['canceled','cancelled'].includes(data.subscription.status)&&<button className="p360Button p360ButtonDanger" disabled={busy} onClick={()=>{if(window.confirm('Deseja cancelar a renovação da assinatura?'))act({action:'cancel'})}}>Cancelar assinatura</button>}</div>
   <p className="p360Footnote">A ativação depende da confirmação real de pagamento. Voltar ao aplicativo não significa que uma cobrança foi aprovada.</p>
  </>}
 </div></main>
}
