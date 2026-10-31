# Plantão360 | Etapa 3.2 (incremental)

Esta atualização adiciona **despesas profissionais** e **relatórios por instituição**, mantendo os plantões, vínculos, pagamentos e assinaturas da versão anterior. Mercado Pago não foi alterado.

## Antes de publicar
1. Crie uma cópia/branch do banco Neon e verifique que está acessível.
2. Faça a atualização em branch de teste no GitHub, preservando os caminhos (Root Directory na Vercel: `plantao360-vercel`).
3. Substitua somente os arquivos incluídos no ZIP incremental. **Não altere `.env` ou variáveis da Vercel.**
4. Confirme Build Ready em Preview, teste login e as páginas `/despesas` e `/relatorios`, depois promova para produção.

## Arquivos
- `app/page.tsx` (links no menu e financeiro)
- `app/style.css` (novos estilos preservando os anteriores)
- `app/despesas/page.tsx`, `app/relatorios/page.tsx`
- `app/api/expenses/route.ts`, `app/api/reports/route.ts`
- `lib/db.ts` (cria tabela `p360_expenses` sem apagar tabelas existentes; remove apenas duplicidade de instruções de criação de planos já presentes no arquivo do ZIP anterior).

## Testes
1. Crie despesa de R$ 30 no mês atual, recarregue e confirme que persiste. Exclua e confira total.
2. Registre plantão e visualize receita por instituição no relatório.
3. Confira que a produção mensal não aumenta ao registrar horas em jornada de contrato fixo.
4. Exporte CSV e abra no Excel.
5. Teste com segunda conta e confirme que não vê dados da primeira.

## Limites
- Ainda não implementa recorrência de plantões, notificações push nem permissão granular de suporte; esses itens continuam pendentes.
- O cálculo de produção fixa é por mês contratual ativo, sem pró-rata.
- CSV é gerado no navegador, sem compartilhar dados com serviços externos.
- Não realizamos teste com banco de produção ou Mercado Pago.
