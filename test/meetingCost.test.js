import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateMeetingCost } from '../src/meetingCost.js';

test('calcula o custo total para uma entrada valida', () => {
  const cost = calculateMeetingCost(5, 30, 120);
  assert.equal(cost, 300);
});

test('permite custo por hora igual a zero', () => {
  const cost = calculateMeetingCost(3, 45, 0);
  assert.equal(cost, 0);
});

test('arredonda corretamente para exibicao com duas casas decimais', () => {
  const cost = calculateMeetingCost(7, 25, 45.5);
  assert.ok(Math.abs(cost - 132.70833333333334) < 1e-9);
  assert.equal(cost.toFixed(2), '132.71');
});

test('rejeita menos de um participante', () => {
  assert.throws(() => calculateMeetingCost(0, 30, 120), RangeError);
  assert.throws(() => calculateMeetingCost(-1, 30, 120), RangeError);
});

test('rejeita duracao nao positiva', () => {
  assert.throws(() => calculateMeetingCost(5, 0, 120), RangeError);
  assert.throws(() => calculateMeetingCost(5, -10, 120), RangeError);
});

test('rejeita custo por hora negativo', () => {
  assert.throws(() => calculateMeetingCost(5, 30, -1), RangeError);
});

test('rejeita entradas nao finitas', () => {
  assert.throws(() => calculateMeetingCost(Number.NaN, 30, 120), RangeError);
  assert.throws(() => calculateMeetingCost(5, Number.POSITIVE_INFINITY, 120), RangeError);
  assert.throws(() => calculateMeetingCost(5, 30, Number.NEGATIVE_INFINITY), RangeError);
});
