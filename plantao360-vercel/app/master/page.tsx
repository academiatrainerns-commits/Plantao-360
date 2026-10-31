'use client';
import {useEffect,useState} from 'react';

type RecordData = any;
const money=(v:unknown)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
const date=(v:string|null)=>v?new Date(v).toLocaleDateString('pt-BR'):'—';

export default function Master(){
 const [data,setData]=useState<RecordData>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 async function load(){const response=await fetch('/api/master',{cache:'no-store'});const payload=await response.json();if(!response.ok)throw Error(payload.error||'Não foi possível carregar o painel');setData(payload)}
 useEffect(()=>{load().catch((e:Error)=>setError(e.message))},[]);
 async function save(input:RecordData){setBusy(input.slug);setError('');setMessage('');try{const response=await fetch('/api/master',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const payload=await response.json();if(!response.ok)throw Error(payload.error||'Falha ao salvar');await load();setMessage('Plano atualizado com sucesso.')}catch(e:any){setError(e.message||'Falha ao salvar')}finally{setBusy(null)}}
 const stats=data?.stats;
 return <main className="p360AdminPage"><div className="p360AdminShell">
  <header className="p360AdminHeader"><a className="p360Back" href="/">← Voltar ao aplicativo</a><div className="p360BrandMark"><span className="p360Pulse">✳</span> Plantão<span>360</span><small>Administração</small></div></header>
  <section className="p360Hero"><div><span className="p360Eyebrow">ÁREA ADMINISTRATIVA</span><h1>Painel Master</h1><p>Acompanhe médicos, planos e assinaturas em um único lugar.</p></div><span className="p360HeroIcon" aria-hidden="true">▦</span></section>
  {error&&<div className="p360Notice p360NoticeError" role="alert">{error}</div>}
  {message&&<div className="p360Notice p360NoticeSuccess" role="status">{message}</div>}
  {!data&&!error&&<p className="p360Loading">Carregando informações...</p>}
  {data&&<>
    <section className="p360Stats" aria-label="Indicadores"><article className="p360Stat"><span>Médicos cadastrados</span><strong>{stats?.users??0}</strong><small>Contas na plataforma</small></article><article className="p360Stat"><span>Assinaturas</span><strong>{stats?.subscriptions??0}</strong><small>Total registrado</small></article><article className="p360Stat"><span>Pagantes</span><strong>{stats?.paying??0}</strong><small>Assinaturas autorizadas</small></article><article className="p360Stat"><span>Receita mensal estimada</span><strong>{money(stats?.mrr)}</strong><small>Valor estimado dos planos ativos</small></article></section>
    <section className="p360Section"><div className="p360SectionHeading"><div><span className="p360Eyebrow">CONFIGURAÇÕES</span><h2>Planos disponíveis</h2><p>Atualize os preços e a disponibilidade para novas assinaturas.</p></div><span className="p360Counter">{data.plans?.length||0} planos</span></div>
    <div className="p360Plans">{(data.plans||[]).map((plan:RecordData)=><form className="p360Plan" key={plan.slug} onSubmit={e=>{e.preventDefault();const fields=new FormData(e.currentTarget);save({slug:plan.slug,name:fields.get('name'),price:Number(fields.get('price')),active:fields.get('active')==='on'})}}><div className="p360PlanTop"><div><span className="p360PlanSlug">{plan.slug}</span><h3>{plan.name}</h3></div><span className="p360PlanBadge">{plan.active?'Disponível':'Inativo'}</span></div><label>Nome do plano<input name="name" defaultValue={plan.name} required maxLength={80}/></label><label>Preço mensal (R$)<input name="price" type="number" step="0.01" min="1" max="10000" defaultValue={plan.price} required/></label><label className="p360Check"><input name="active" type="checkbox" defaultChecked={plan.active}/> Disponível para contratação</label><button className="p360Button" disabled={busy!==null} type="submit">{busy===plan.slug?'Salvando...':'Salvar alterações'}</button></form>)}</div></section>
    <section className="p360Section"><div className="p360SectionHeading"><div><span className="p360Eyebrow">ACOMPANHAMENTO</span><h2>Assinaturas recentes</h2></div></div><div className="p360Table"><table><thead><tr><th>Médico</th><th>Plano</th><th>Situação</th><th>Pago até</th></tr></thead><tbody>{(data.subscriptions||[]).length?(data.subscriptions||[]).map((s:RecordData)=><tr key={s.id}><td><strong>{s.name}</strong><small>{s.email}</small></td><td>{s.plan_slug}</td><td><span className="p360Status">{s.status}</span></td><td>{date(s.paid_until)}</td></tr>):<tr><td colSpan={4} className="p360Empty">Ainda não existem assinaturas cadastradas.</td></tr>}</tbody></table></div></section>
    <section className="p360Section"><div className="p360SectionHeading"><div><span className="p360Eyebrow">USUÁRIOS</span><h2>Médicos cadastrados</h2></div></div><div className="p360Table"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Plano</th></tr></thead><tbody>{(data.users||[]).length?(data.users||[]).map((u:RecordData)=><tr key={u.id}><td><strong>{u.name}</strong></td><td>{u.email}</td><td>{u.plan_slug||'Sem assinatura'}</td></tr>):<tr><td colSpan={3} className="p360Empty">Nenhum médico cadastrado.</td></tr>}</tbody></table></div></section>
  </>}
 </div></main>
}
