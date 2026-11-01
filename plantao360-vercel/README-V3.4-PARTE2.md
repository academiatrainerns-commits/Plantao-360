# Plantão360 3.4, Parte 2: checkout Hotmart e Kiwify (etapa segura)

**Escopo entregue:** tela de seleção das duas plataformas e início do checkout por links oficiais HTTPS, configuráveis por plano na Vercel. O backend exige usuário autenticado, plano ativo e evita oferecer nova compra para quem já tem assinatura ativa.

## Configuração Preview (somente branch versao-3-3)

Cadastre na Vercel os links HTTPS reais correspondentes a cada plano contratado:

- HOTMART_CHECKOUT_ESSENCIAL
- HOTMART_CHECKOUT_PRO
- HOTMART_CHECKOUT_PREMIUM
- KIWIFY_CHECKOUT_ESSENCIAL
- KIWIFY_CHECKOUT_PRO
- KIWIFY_CHECKOUT_PREMIUM

As opções sem URL ficam desativadas. Cada link deve apontar ao produto de **assinatura mensal** correto e preço confirmado na plataforma. Os preços exibidos no Plantão360 não são sincronizados automaticamente com o checkout. Refaça o deploy do Preview após editar variáveis.

## Segurança e pendências ANTES de receber pagamentos reais

- **Esta parte NÃO libera assinaturas após pagamento**. Webhooks estão intencionalmente desabilitados (HTTP 503) até implementação e teste de autenticação, associação segura do pagador à conta, eventos de renovação, cancelamento, reembolso, idempotência e reconciliação.
- O sistema ainda tem tabelas e campos legados do Mercado Pago. Foram preservados para evitar migrações destrutivas. A API anterior de criação/cancelamento MP deixa de ser utilizada nesta tela.
- Falta implementar e validar bloqueio de acesso após o teste gratuito (não está incluído neste pacote).
- Falta implementar parceiros, cupons e comissões. Configurar esses valores nas plataformas e definir se a comissão será paga pela plataforma ou pelo sistema, sem duplicidade.
- Não publique os links de checkout nem cobre usuários antes de completar a confirmação segura dos pagamentos. Teste apenas navegação da interface e planos desabilitados enquanto não houver URLs.
- Evite deixar o endereço do Preview como callback de produção: use domínio final depois da aprovação.
- Remova a rota temporária `app/api/diagnostico-db/route.ts` **e depois** a variável `DIAGNOSTIC_ADMIN_USER_ID` do Preview, após concluir o diagnóstico.

## Arquivos desta atualização

- app/api/billing/route.ts
- app/assinatura/page.tsx
- app/api/webhooks/hotmart/route.ts
- app/api/webhooks/kiwify/route.ts

Envie os caminhos relativos acima para `plantao360-vercel/` na branch `versao-3-3`. Não substitua outras pastas nem faça merge com `main`.
