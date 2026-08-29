---
description: Regras de dominio e arquitetura do modulo de calculo do Meeting Cost CLI (src/**)
globs: src/**
alwaysApply: false
---

# Dominio: calculo de custo de reuniao (src/**)

- `calculateMeetingCost` (em `src/meetingCost.js`) e a unica fonte da regra
  de negocio. Deve permanecer uma funcao pura e exportada: mesma entrada
  sempre produz a mesma saida, sem I/O, sem `console.*`, sem acesso a
  `process` e sem efeitos colaterais.
- Ordem de validacao existente, nao reordenar sem motivo: primeiro checa se
  `participants`, `durationMinutes` e `hourlyRate` sao finitos; depois
  `participants >= 1`; depois `durationMinutes > 0`; depois
  `hourlyRate >= 0`. Cada violacao lanca `RangeError` com mensagem
  acionavel em portugues.
- Formula do calculo: `participants * (durationMinutes / 60) * hourlyRate`.
  Qualquer alteracao de formula deve manter as unidades: minutos convertidos
  para horas antes de multiplicar pelo custo por hora.
- `hourlyRate === 0` e valido (reuniao sem custo por hora nao e erro);
  apenas valores negativos sao rejeitados.
- Este diretorio usa ESM nativo (`import`/`export`). Nao introduzir
  `require`, nem dependencias externas — o modulo de dominio hoje depende
  somente de recursos nativos do Node.js.
- Leitura de `process.argv` e impressao no terminal pertencem a `bin/cli.js`,
  nao a `src/**`. Nao mover logica de entrada/saida para dentro do modulo
  de dominio.
