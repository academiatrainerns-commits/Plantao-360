# Plantão360 3.3.1 - Correções de Agenda e Plantões

## Arquivos alterados
- `app/api/[resource]/route.ts`: valida conflitos de horários com registros em Plantões e Agenda antes de criar plantões, inclusive quando passam da meia-noite.
- `app/api/agenda/route.ts`: consulta a agenda e os plantões existentes em uma única visão; ao agendar com local, cria um plantão com status Agendado; valida conflitos nas duas origens; permite marcar, cancelar e excluir os plantões exibidos.
- `app/agenda/page.tsx`: corrige a leitura dos locais de trabalho retornados por `/api/institutions` e esclarece o cadastro integrado.

## Instalação
Aplicar somente na branch `versao-3-3` no GitHub e validar em Preview da Vercel. Não substituir configurações do Neon, senhas ou variáveis de ambiente. Os caminhos do ZIP são relativos à raiz do repositório.

## Testes manuais recomendados
1. Conferir que os locais cadastrados aparecem em Agenda > Agendar plantão.
2. Cadastrar plantão em Novo plantão. Confirmar que aparece na Agenda no mês selecionado.
3. Cadastrar plantão pela Agenda. Confirmar que aparece em Meus plantões como Agendado.
4. Tentar dois plantões com horários sobrepostos, inclusive em locais diferentes. Deve retornar erro de conflito.
5. Tentar horário que atravesse a meia-noite e outro no dia seguinte com sobreposição.
6. Repetir agenda semanal em três datas e verificar todas as ocorrências.
7. Cancelar/excluir um plantão na agenda e verificar sincronização com Meus plantões.

## Limites conhecidos
- A correção não elimina registros conflitantes já existentes, nem os converte automaticamente.
- Eventos antigos cadastrados exclusivamente na tabela de agenda continuam aparecendo como eventos independentes. Operações nesses eventos não criam produção financeira retroativa.
- Em requisições simultâneas muito próximas, a checagem de conflitos não é uma garantia transacional. Para garantia absoluta em produção, recomenda-se uma restrição de exclusão no banco ou mecanismo transacional.
- Horários foram interpretados no fuso `America/Sao_Paulo`. Se o sistema atender outros fusos, o fuso deverá ser configurável por usuário.
- Não foi realizado teste de integração com uma instância Neon real neste ambiente.
