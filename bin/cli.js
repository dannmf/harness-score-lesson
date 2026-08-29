#!/usr/bin/env node
import { calculateMeetingCost } from '../src/meetingCost.js';

function parseArgs(argv) {
  const [participantsRaw, durationRaw, hourlyRateRaw] = argv;
  return {
    participants: Number(participantsRaw),
    durationMinutes: Number(durationRaw),
    hourlyRate: Number(hourlyRateRaw),
  };
}

function main() {
  const argv = process.argv.slice(2);

  if (argv.length !== 3) {
    console.error('Uso: npm start -- <participantes> <duracao_minutos> <custo_por_hora>');
    console.error('Exemplo: npm start -- 5 30 120');
    process.exitCode = 1;
    return;
  }

  const { participants, durationMinutes, hourlyRate } = parseArgs(argv);

  try {
    const cost = calculateMeetingCost(participants, durationMinutes, hourlyRate);
    console.log(`Participantes: ${participants}`);
    console.log(`Duracao: ${durationMinutes} min`);
    console.log(`Custo por hora: ${hourlyRate}`);
    console.log(`Custo total da reuniao: ${cost.toFixed(2)}`);
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
