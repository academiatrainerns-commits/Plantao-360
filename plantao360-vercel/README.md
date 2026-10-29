# Plantão360 | Etapa 1 (Vercel)

Aplicativo mobile web com cadastro de médicos, login, instituições, plantões, recebimentos e dashboard. Construído em Next.js 15, Neon Postgres e PWA.

## Publicar na Vercel (passos mínimos)

1. Envie esta pasta para um **repositório privado do GitHub**. Na Vercel, clique **Add New > Project**, importe o repositório e confirme o deploy.
2. Na aba **Storage** do projeto na Vercel, conecte um banco **Neon Postgres** e habilite a disponibilização da variável `DATABASE_URL` para o projeto. Se a integração fornecer outra variável, crie `DATABASE_URL` com a URL de conexão Postgres.
3. Em **Settings > Environment Variables**, crie `APP_SECRET` com uma chave aleatória de **pelo menos 32 caracteres**. Clique em **Redeploy** em Deployments. Acesse a URL pública, cadastre sua conta e comece.

O banco cria as tabelas automaticamente no primeiro acesso autenticado. Não há instalador separado, SQL manual ou seed de dados.

Para gerar chave, execute localmente: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Desenvolvimento local

Copie `.env.example` para `.env.local`, configure `DATABASE_URL` e `APP_SECRET`, rode `npm install` e `npm run dev`.

## Incluído

- Cadastro e login com hash bcrypt; cookie assinado, httpOnly e SameSite.
- Isolamento por usuário e consultas parametrizadas.
- Instituições com valor por hora.
- Plantões com datas, horário, cruzamento de meia-noite, status e valor por hora.
- Dashboard com produção concluída, recebido, pendente, horas e média.
- Registro e atualização de total recebido por plantão.
- PWA instalável (manifest, ícone vetorial e cache de recursos estáticos).

## Limites desta Etapa 1

- Agenda é apresentada em lista mensal, sem calendário visual em grade.
- Turnos de exatamente 24 horas não são cadastráveis; duração superior a 24h, intervalos e remuneração fixa ainda não estão implementados.
- Pagamento é informado manualmente; não há integração de cobrança Mercado Pago nesta etapa.
- Sem assinatura ou painel Master nesta etapa.
- Não existe recuperação de senha, verificação de e-mail, MFA, rate limiting de login ou auditoria detalhada; implementar antes de abertura comercial ampla.
- Não armazenar dados de pacientes, prontuários ou informações sensíveis de saúde.
- O PWA permite instalar e usar quando conectado. **Não há edição offline** nesta etapa.

## Segurança de produção

Use repositório privado e mantenha `.env.local` fora do Git. Defina `APP_SECRET` exclusiva e forte, HTTPS no domínio e controle quem acessa o banco. Antes da comercialização, implemente reset de senha, confirmação de e-mail, limitação de tentativas de acesso, exportação/exclusão de dados, política LGPD, backup e auditoria.

## Atualização Etapa 2 (jornadas, atendimentos e financeiro)

Esta atualização adiciona novas tabelas automaticamente no primeiro acesso após o deploy, sem excluir os médicos, locais e plantões existentes. **Use o mesmo banco Neon e mantenha `APP_SECRET` exatamente igual.** Substituir `APP_SECRET` derruba as sessões atuais; trocar o banco faz os dados anteriores não aparecerem.

Inclui: vínculos mensais com remuneração fixa, registro de jornadas realizadas, produção por consulta/procedimento, recebimentos parciais de contratos, baixa de atendimentos e resumo financeiro combinado. Plantões existentes continuam acessíveis e suas baixas continuam na lista de plantões.

### Atenções

- O valor mensal de um contrato ativo é considerado integralmente como produção no mês, mesmo com início/fim no meio do mês. Não há cálculo proporcional automático nesta versão.
- Horas registradas em jornadas fixas são somadas às horas de plantão. **Não registre o mesmo período nos dois módulos**, para evitar duplicidade de horas.
- Recebimentos de contrato são limitados ao valor mensal combinado por referência de mês.
- Esta etapa não inclui integração de assinaturas, emissão fiscal, exclusão/edição de todos os lançamentos ou um extrato financeiro contábil completo.
- A aplicação deve ser testada em Preview antes de atualizar Production. Não foi possível executar um build completo neste ambiente por indisponibilidade das dependências npm.
