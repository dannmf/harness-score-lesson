---
name: add-calculation-case
description: Use when adding a new validation rule or changing the cost formula in src/meetingCost.js, including any new edge case for meeting cost calculation.
---

# Adicionar ou alterar um caso de calculo

Processo repetivel para mudar a regra de negocio em
`src/meetingCost.js` sem quebrar as invariantes existentes.

## 1. Delimitar a mudanca

- Identifique se a mudanca e uma nova validacao (rejeitar mais um tipo de
  entrada invalida) ou uma mudanca na formula de custo.
- Releia `calculateMeetingCost` inteira antes de editar; ela e curta e a
  mudanca deve se encaixar na mesma ordem de checagens ja existente
  (finito -> participantes -> duracao -> custo por hora).

## 2. Implementar no modulo de dominio

- Edite somente `src/meetingCost.js`. Nao adicione a validacao em
  `bin/cli.js` — esse arquivo so deve saber ler argv e imprimir.
- Toda validacao nova deve lancar `RangeError` com mensagem curta,
  acionavel e em portugues, seguindo o padrao das mensagens existentes.
- Se a mudanca for na formula, mantenha a funcao pura: sem `console.*`,
  sem `process`, sem estado externo.

## 3. Cobrir os casos de borda

Antes de considerar a mudanca pronta, verifique explicitamente:

- O valor limite exato (ex.: `participants === 1`, `durationMinutes === 0`
  vs `durationMinutes` levemente positivo, `hourlyRate === 0` vs negativo).
- Valores nao finitos (`NaN`, `Infinity`, `-Infinity`) continuam sendo
  rejeitados pela checagem de `Number.isFinite`.
- Um caso valido tipico continua retornando o mesmo resultado de antes da
  mudanca (sem regressao).

## 4. Verificar manualmente

Este repositorio nao tem framework de testes automatizados. A verificacao
e manual, via CLI:

- Caso valido: `npm start -- <participants> <durationMinutes> <hourlyRate>`
  e confira a linha "Custo total da reuniao" contra o calculo esperado a
  mao.
- Cada novo caso de borda invalido: rode o mesmo comando com o valor
  limite e confirme que a saida em `stderr` comeca com `Erro:` e descreve
  o problema, e que o processo termina com codigo diferente de zero.
- Rode tambem um caso valido conhecido (ex.: `npm start -- 5 30 120` deve
  seguir retornando `300.00`) para garantir que nada foi quebrado.

## 5. Sincronizar documentacao minima

- Se a saida ou os argumentos aceitos mudarem de forma visivel ao usuario,
  atualize o exemplo em `PROJETO.md` para refletir o novo comportamento.
- Nao adicione testes, lint, typecheck ou dependencias como parte desta
  skill — esses sensors estao deliberadamente fora do escopo atual do
  repositorio.
