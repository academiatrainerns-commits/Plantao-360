# Plantão360 v3.4, parte 1: cadastro e teste gratuito

Esta atualização deve ser aplicada **apenas à branch de testes `versao-3-3`**, até ser validada. Não publicar na `main` sem aprovação.

## O que muda
- Cadastro solicita nome, e-mail, senha, WhatsApp com DDD e aceite explícito dos termos.
- Novas contas recebem um período de teste com início e fim registrados no banco do Neon (7 dias).
- Painel Master mostra os contatos e a data de término do teste. Somente o administrador autorizado por `MASTER_EMAIL` tem acesso à API Master.
- Cadastros anteriores permanecem disponíveis, sem gerar novo teste automaticamente.

## Limites e próximos passos
- **Esta etapa NÃO bloqueia automaticamente o acesso após sete dias.** O período fica registrado, mas a regra de acesso precisa ser implementada e testada de ponta a ponta.
- Ainda não há envio automático de WhatsApp, avisos, integração de cupons, cálculo de comissões nem repasses a parceiros.
- Os links de termos e política de privacidade precisam ser publicados antes de usar o cadastro publicamente. O aceite do formulário não substitui essas páginas.
- Não houve alteração em cobranças reais nem webhooks do Mercado Pago.

## Instalação
1. No GitHub, escolha a branch `versao-3-3` e abra a pasta `plantao360-vercel`.
2. Envie a pasta `app` e a pasta `lib` fornecidas, preservando a estrutura, em um único commit.
3. Não faça upload da pasta `plantao360-vercel` para dentro dela mesma.
4. Confira a compilação no Preview da Vercel. Use apenas a branch de teste do Neon.
5. Faça novo cadastro de usuário de teste e confirme a linha correspondente no Painel Master.
6. **Remova a rota de diagnóstico temporária `app/api/diagnostico-db/route.ts` no GitHub** e exclua `DIAGNOSTIC_ADMIN_USER_ID` da Vercel após os testes. A exclusão não ocorre automaticamente por este ZIP.

## Privacidade e segurança
- Os telefones são dados pessoais: conceda acesso Master só a pessoas autorizadas, defina retenção e publique política de privacidade.
- Antes de testar com contatos reais, revise conformidade com LGPD e evite guardar dados fictícios junto aos de produção.
