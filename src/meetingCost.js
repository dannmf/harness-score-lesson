/**
 * Calcula o custo total de mao de obra de uma reuniao.
 *
 * @param {number} participants - Numero de participantes (finito, >= 1).
 * @param {number} durationMinutes - Duracao da reuniao em minutos (finito, > 0).
 * @param {number} hourlyRate - Custo por hora por participante (finito, >= 0).
 * @returns {number} Custo total da reuniao.
 * @throws {RangeError} Se algum valor for nao finito ou estiver fora do intervalo permitido.
 */
export function calculateMeetingCost(participants, durationMinutes, hourlyRate) {
  if (
    !Number.isFinite(participants) ||
    !Number.isFinite(durationMinutes) ||
    !Number.isFinite(hourlyRate)
  ) {
    throw new RangeError('participants, durationMinutes e hourlyRate devem ser numeros finitos.');
  }
  if (participants < 1) {
    throw new RangeError('participants deve ser no minimo 1.');
  }
  if (durationMinutes <= 0) {
    throw new RangeError('durationMinutes deve ser maior que zero.');
  }
  if (hourlyRate < 0) {
    throw new RangeError('hourlyRate nao pode ser negativo.');
  }

  const hours = durationMinutes / 60;
  return participants * hours * hourlyRate;
}
