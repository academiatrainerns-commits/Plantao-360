# Plantão360 — Etapa 3

Atualização do código existente (sem troca do banco Neon).

## Publicação
1. Faça backup do banco Neon.
2. Extraia o ZIP e substitua o conteúdo do repositório do projeto na Vercel.
3. Em Settings > Environment Variables, mantenha DATABASE_URL e APP_SECRET, e adicione:
   - MASTER_EMAIL: e-mail exato do usuário já cadastrado que administrará o sistema.
   - MP_ACCESS_TOKEN: token secreto do Mercado Pago (nunca no cliente).
   - MP_WEBHOOK_SECRET: chave de assinatura secreta de Webhooks no Mercado Pago.
   - NEXT_PUBLIC_APP_URL: URL da produção, ex. https://plantao360.vercel.app (sem barra final).
4. Faça redeploy.
5. Acesse /master logado com MASTER_EMAIL. Acesse /assinatura para selecionar plano.
6. Mercado Pago > Suas integrações > Webhooks: POST https://SEU-DOMINIO/api/webhooks/mercadopago, selecionar subscription_preapproval e subscription_authorized_payment e payment.

## Importante
O Mercado Pago é acionado de verdade somente se o token foi configurado. Use credenciais de teste e um projeto Preview antes de ativar produção. A integração não pode ser confirmada sem credenciais reais e execução de pagamentos de teste.

**Limitação desta entrega**: os módulos médicos existentes seguem liberados enquanto a assinatura é testada. `active` é calculado por status autorizado + cobrança aprovada + vigência; o bloqueio obrigatório dos recursos médicos não foi ativado. Não comercialize como controle de acesso plenamente finalizado antes de testar conciliação, alterações de plano, estornos e suspensão por inadimplência. O valor de assinatura existente não deve ser editado retroativamente.

## Segurança
As rotas master verificam sessão e e-mail da variável MASTER_EMAIL no servidor. Nenhum valor de prontuário de terceiros é exibido no painel Master. A autenticação e autorização existentes devem ser testadas em ambiente Preview.
