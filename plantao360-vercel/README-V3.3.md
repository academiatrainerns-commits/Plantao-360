# Plantão360 | Etapa 3.3 (sem Mercado Pago)

## Atualização no GitHub
Atualize somente estes arquivos, dentro de `plantao360-vercel`:

1. `lib/db.ts` (tabela aditiva `p360_agenda`, não elimina dados)
2. `app/api/agenda/route.ts` (novo)
3. `app/agenda/page.tsx` (novo)
4. `app/page.tsx` (menu com atalho para agenda)
5. `app/style.css` (estilos adicionais; mantém PDF)

Crie branch `versao-3-3` a partir da `main`, envie os arquivos mantendo os caminhos, teste Preview e só depois mescle para `main`.

## Cuidados
- Faça um snapshot/branch Neon antes de alterar banco; teste Preview com banco separado para evitar escrita em produção.
- A tabela agenda não lança faturamento: produção continua sendo controlada pelos plantões e módulos financeiros existentes.
- Recorrência até 26 ocorrências (semana, quinzena, mês). Verificação de conflitos em agenda por usuário, com resposta 409.
- Horas realizadas são registradas manualmente na agenda. Não alteram automaticamente o relatório de produção.
- Avisos aparecem ao abrir a agenda, sem push, agendamento em servidor ou notificações de sistema.
- Rotas autenticadas isolam registros por `user_id`; testar também erros de autorização.
- Não liga cobrança Mercado Pago.
- Não foi realizado teste end-to-end contra seu banco Neon e seu ambiente Vercel. Faça os testes no Preview antes de mesclar.
