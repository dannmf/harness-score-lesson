#!/usr/bin/env node
/**
 * PostToolUse feedback hook for Write|Edit.
 *
 * Reads the hook payload as JSON from stdin, and if the written/edited
 * file is a JavaScript or JSON file supported by the repo's local Biome
 * install, runs `biome format --write` on it. Best-effort formatting
 * guidance for the agent loop; never blocks the tool call and never
 * replaces CI, which remains the source of truth for formatting.
 *
 * No dependencies: only Node.js core modules.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const SUPPORTED_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.json', '.jsonc']);

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

/** @param {string} root */
function findLocalBiomeBin(root) {
  const binName = process.platform === 'win32' ? 'biome.cmd' : 'biome';
  const candidate = join(root, 'node_modules', '.bin', binName);
  return existsSync(candidate) ? candidate : null;
}

async function main() {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    process.stdout.write('{}');
    process.exitCode = 0;
    return;
  }

  const filePath =
    (payload?.tool_response &&
      typeof payload.tool_response.filePath === 'string' &&
      payload.tool_response.filePath) ||
    (payload?.tool_input &&
      typeof payload.tool_input.file_path === 'string' &&
      payload.tool_input.file_path) ||
    null;

  if (
    !filePath ||
    !SUPPORTED_EXTENSIONS.has(extname(filePath).toLowerCase()) ||
    !existsSync(filePath)
  ) {
    process.stdout.write('{}');
    process.exitCode = 0;
    return;
  }

  const biomeBin = findLocalBiomeBin(process.cwd());
  if (biomeBin) {
    spawnSync(biomeBin, ['format', '--write', filePath], { stdio: 'ignore' });
  }

  process.stdout.write('{}');
  process.exitCode = 0;
}

main();
