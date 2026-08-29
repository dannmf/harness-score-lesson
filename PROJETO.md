# Meeting Cost CLI

CLI minima em Node.js (ESM) que calcula o custo total de mao de obra de uma
reuniao a partir do numero de participantes, da duracao em minutos e do custo
por hora.

## Uso

```
npm start -- <participantes> <duracao_minutos> <custo_por_hora>
```

Exemplo:

```
npm start -- 5 30 120
```

Saida:

```
Participantes: 5
Duracao: 30 min
Custo por hora: 120
Custo total da reuniao: 300.00
```

Entradas invalidas (nao finitas, menos de 1 participante, duracao nao
positiva ou custo por hora negativo) resultam em uma mensagem de erro
acionavel e saida com codigo diferente de zero.
