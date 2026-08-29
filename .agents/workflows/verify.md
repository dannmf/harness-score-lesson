---
description: Workflow de verificacao do Meeting Cost CLI apos qualquer mudanca de codigo
---

# Workflow: verificar o Meeting Cost CLI

Rode os comandos reais definidos em `package.json`, nesta ordem:

1. `npm run check` - executa `lint`, `typecheck` e `test` em sequencia.
   Use este comando sozinho no caso comum.
2. Se `check` falhar, isole a etapa com `npm run lint`, `npm run typecheck`
   ou `npm test`, corrija, e rode `npm run check` de novo.
3. Antes de finalizar, rode `npm run format` para aplicar a formatacao do
   Biome.

Para o processo detalhado de adicionar/alterar uma regra de calculo
(incluindo quais casos de borda cobrir), use a skill
`.agents/skills/add-calculation-case/SKILL.md` em vez de repetir os passos
aqui.

Para verificar o comportamento observavel do CLI manualmente, use
`npm start -- <participantes> <duracao_minutos> <custo_por_hora>` com um
caso valido e um caso invalido.

## Sensors

Lint (Biome), formatacao (Biome), typecheck (TypeScript com `checkJs`) e
testes (`node --test`) existem e sao obrigatorios em CI
(`.github/workflows/ci.yml`). Nao ha sensors pendentes.
