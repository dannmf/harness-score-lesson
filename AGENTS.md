# AGENTS.md

Meeting Cost CLI: calcula o custo total de mao de obra de uma reuniao a
partir de participantes, duracao (min) e custo por hora. Sem rede, sem
persistencia, sem UI.

## Estrutura e comandos

- `package.json` - ESM (`"type": "module"`), `engines.node >=24`, sem
  dependencias de runtime, script `start` -> `node bin/cli.js`.
- `bin/cli.js` - entrada: le `process.argv`, converte para numero, chama o
  dominio, imprime resultado ou erro. Nao contem regras de negocio.
- `src/meetingCost.js` - dominio puro: exporta `calculateMeetingCost`,
  com JSDoc tipado.
- `test/meetingCost.test.js` - testes com o test runner nativo do Node.js.
- `tsconfig.json` - typecheck estrito (`checkJs`, `noEmit`) sobre
  `src/`, `bin/` e `test/`.
- `biome.json` - lint e formatacao (Biome).
- `.github/workflows/ci.yml` - CI (push em `main` e pull requests),
  permissao `contents: read`.
- `PROJETO.md`, `README.md`, `LICENSE` - preservar como estao.
- `.gitignore` (node_modules, coverage, .env*, exceto .env.example) e
  `package-lock.json` existem para higiene.
- `.agents/rules/meeting-cost-domain.md` - regras de dominio/arquitetura
  com escopo `src/**`, carregada quando um agente edita arquivos ali.
- `.agents/skills/add-calculation-case/SKILL.md` - processo para adicionar
  ou alterar uma regra de calculo; acionada quando essa tarefa surgir.
- `.agents/workflows/verify.md` - comandos reais de verificacao (ver esse
  arquivo para o passo a passo; nao duplicado aqui).
- devDependencies fixadas: `@biomejs/biome@2.5.3`, `typescript@5.9.3`,
  `@types/node@24.13.3`. Nenhuma dependencia de runtime.

Comandos reais (`package.json`): `npm start -- <p> <min> <r>`, `npm test`,
`npm run lint`, `npm run format`, `npm run typecheck`, `npm run check`
(lint + typecheck + test). Nao ha build ou deploy definidos.

## Invariantes de dominio (`calculateMeetingCost`)

- `participants`, `durationMinutes`, `hourlyRate` devem ser finitos.
- `participants >= 1`.
- `durationMinutes > 0`.
- `hourlyRate >= 0`.
- Violacao -> `RangeError`. Calculo: `participants * (durationMinutes/60) *
  hourlyRate`.
- `bin/cli.js` valida so a contagem de argumentos (exatamente 3); erros de
  dominio sao capturados e impressos como `Erro: <mensagem>` em `stderr`
  com `process.exitCode = 1`. Saida valida vai para `stdout` via
  `console.log`.

## Politica de runtime e seguranca

- Sem dependencias de runtime; nao adicionar novas dependencias (runtime
  ou dev) sem pedido explicito do usuario.
- Nao introduzir rede, subprocessos, leitura/escrita de arquivos
  arbitrarios ou `eval`/execucao dinamica de codigo.
- Nao alterar `README.md`/`LICENSE`; nao criar testes, lint, CI, MCP,
  hooks ou pre-commit sem pedido explicito.
- Nao commitar sem instrucao explicita.

## Checklist de conclusao

- [ ] Dominio em `src/meetingCost.js` continua puro/exportado.
- [ ] `bin/cli.js` mantem so leitura de argv + output.
- [ ] As 4 invariantes de dominio continuam lancando `RangeError`.
- [ ] Entrada valida imprime resultado claro; entrada invalida imprime erro
  acionavel com exit code != 0.
- [ ] `npm run check` passa (lint, typecheck e testes).
- [ ] Nenhuma dependencia, workflow de CI ou outro arquivo fora do escopo
  foi adicionado sem pedido explicito.
