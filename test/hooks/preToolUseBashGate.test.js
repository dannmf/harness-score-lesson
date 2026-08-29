import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

const HOOK_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../.claude/hooks/pretooluse-bash-gate.js',
);

/** @param {string} stdinPayload */
function runGate(stdinPayload) {
  const result = spawnSync(process.execPath, [HOOK_PATH], {
    input: stdinPayload,
    encoding: 'utf8',
  });
  return {
    exitCode: result.status,
    response: JSON.parse(result.stdout),
  };
}

/** @param {string} command */
function runCommand(command) {
  return runGate(JSON.stringify({ tool_name: 'Bash', tool_input: { command } }));
}

test('permite comandos comuns', () => {
  for (const command of [
    'npm test',
    'npm run check',
    'ls -la',
    'git status',
    'node bin/cli.js 5 30 120',
  ]) {
    const { exitCode, response } = runCommand(command);
    assert.equal(exitCode, 0);
    assert.equal(response.hookSpecificOutput.permissionDecision, 'allow');
  }
});

test('nega npm publish', () => {
  const { response } = runCommand('npm publish');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(response.hookSpecificOutput.permissionDecisionReason, /npm publish/);
});

test('nega git push --force', () => {
  const { response } = runCommand('git push --force origin main');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'deny');
});

test('nega git reset --hard', () => {
  const { response } = runCommand('git reset --hard HEAD~1');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'deny');
});

test('nega remocao recursiva de uma raiz ou home', () => {
  for (const command of ['rm -rf /', 'rm -fr ~', 'rm -r -f $HOME']) {
    const { response } = runCommand(command);
    assert.equal(
      response.hookSpecificOutput.permissionDecision,
      'deny',
      `esperava deny para: ${command}`,
    );
  }
});

test('permite rm -rf em um subdiretorio comum (nao e raiz ou home)', () => {
  const { response } = runCommand('rm -rf node_modules');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'allow');
});

test('nega padroes destrutivos do Remove-Item do PowerShell', () => {
  const { response } = runCommand('Remove-Item -Recurse -Force C:\\');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'deny');
});

test('retorna ask quando o payload nao e JSON valido', () => {
  const { response } = runGate('isso nao e json');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'ask');
});

test('retorna ask quando o payload nao contem tool_input.command', () => {
  const { response } = runGate(JSON.stringify({ tool_name: 'Bash', tool_input: {} }));
  assert.equal(response.hookSpecificOutput.permissionDecision, 'ask');
});

test('retorna ask para payload vazio', () => {
  const { response } = runGate('');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'ask');
});
