#!/usr/bin/env node
/**
 * PreToolUse gate hook for the Bash tool.
 *
 * Reads the hook payload (tool_name, tool_input.command) as JSON from
 * stdin and writes a permission decision to stdout via
 * hookSpecificOutput.permissionDecision: 'allow' | 'deny' | 'ask'.
 *
 * No dependencies: only Node.js core modules.
 */

const SEPARATOR_PATTERN = /&&|\|\||[;|\n]/;

/** @param {string} token */
function unquote(token) {
  if (token.length >= 2) {
    const first = token[0];
    const last = token[token.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return token.slice(1, -1);
    }
  }
  return token;
}

/** @param {string} subcommand */
function tokenize(subcommand) {
  return subcommand.trim().split(/\s+/).filter(Boolean).map(unquote);
}

// biome-ignore lint/suspicious/noTemplateCurlyInString: literal shell env var syntax, not a template literal placeholder.
const ROOT_OR_HOME_TARGETS = new Set(['/', '~', '$HOME', '${HOME}']);

/** @param {string[]} tokens */
function isNpmPublish(tokens) {
  return (
    /^npm(\.cmd)?$/i.test(tokens[0] ?? '') && tokens.some((t) => t.toLowerCase() === 'publish')
  );
}

/** @param {string[]} tokens */
function isGitPushForce(tokens) {
  if (!/^git$/i.test(tokens[0] ?? '')) return false;
  const hasPush = tokens.some((t) => t.toLowerCase() === 'push');
  const hasForce = tokens.some((t) =>
    ['--force', '--force-with-lease', '-f'].includes(t.toLowerCase()),
  );
  return hasPush && hasForce;
}

/** @param {string[]} tokens */
function isGitResetHard(tokens) {
  if (!/^git$/i.test(tokens[0] ?? '')) return false;
  const hasReset = tokens.some((t) => t.toLowerCase() === 'reset');
  const hasHard = tokens.some((t) => t.toLowerCase() === '--hard');
  return hasReset && hasHard;
}

/** @param {string[]} tokens */
function isDangerousRm(tokens) {
  if (!/^rm$/i.test(tokens[0] ?? '')) return false;
  const flagTokens = tokens.slice(1).filter((t) => t.startsWith('-'));
  const flagChars = flagTokens
    .filter((t) => !t.startsWith('--'))
    .join('')
    .toLowerCase();
  const longFlags = flagTokens.filter((t) => t.startsWith('--')).map((t) => t.toLowerCase());
  const hasRecursive = flagChars.includes('r') || longFlags.includes('--recursive');
  const hasForce = flagChars.includes('f') || longFlags.includes('--force');
  if (!hasRecursive || !hasForce) return false;

  const targets = tokens.slice(1).filter((t) => !t.startsWith('-'));
  return targets.some((target) => {
    const normalized = target.length > 1 && target.endsWith('/') ? target.slice(0, -1) : target;
    return ROOT_OR_HOME_TARGETS.has(normalized);
  });
}

/** @param {string[]} tokens */
function isDestructivePowerShellRemoveItem(tokens) {
  const hasRemoveItem = tokens.some((t) => t.toLowerCase() === 'remove-item');
  if (!hasRemoveItem) return false;
  const hasRecurse = tokens.some((t) => t.toLowerCase() === '-recurse');
  const hasForce = tokens.some((t) => t.toLowerCase() === '-force');
  return hasRecurse && hasForce;
}

const DENY_RULES = [
  { name: 'npm-publish', test: isNpmPublish, message: 'npm publish esta bloqueado por este hook.' },
  {
    name: 'git-push-force',
    test: isGitPushForce,
    message: 'git push --force esta bloqueado por este hook.',
  },
  {
    name: 'git-reset-hard',
    test: isGitResetHard,
    message: 'git reset --hard esta bloqueado por este hook.',
  },
  {
    name: 'rm-rf-root-or-home',
    test: isDangerousRm,
    message: 'Remocao recursiva de uma raiz ou home esta bloqueada por este hook.',
  },
  {
    name: 'powershell-remove-item-destructive',
    test: isDestructivePowerShellRemoveItem,
    message: 'Remove-Item -Recurse -Force esta bloqueado por este hook.',
  },
];

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

/**
 * @param {'allow'|'deny'|'ask'} permissionDecision
 * @param {string} reason
 */
function respond(permissionDecision, reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision,
      permissionDecisionReason: reason,
    },
  };
  if (permissionDecision !== 'allow') {
    output.systemMessage = reason;
  }
  return output;
}

/** @param {string} raw */
function decide(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return respond('ask', 'Payload do hook nao pode ser interpretado como JSON.');
  }

  const command =
    payload?.tool_input && typeof payload.tool_input.command === 'string'
      ? payload.tool_input.command
      : null;

  if (!command || command.trim() === '') {
    return respond('ask', 'Payload do hook nao contem tool_input.command utilizavel.');
  }

  const subcommands = command.split(SEPARATOR_PATTERN);
  for (const subcommand of subcommands) {
    const tokens = tokenize(subcommand);
    if (tokens.length === 0) continue;

    for (const rule of DENY_RULES) {
      if (rule.test(tokens)) {
        return respond('deny', `Comando bloqueado pela regra "${rule.name}": ${rule.message}`);
      }
    }
  }

  return respond(
    'allow',
    'Comando permitido pelo gate padrao (nenhuma regra de bloqueio correspondeu).',
  );
}

async function main() {
  let response;
  try {
    const raw = await readStdin();
    response = decide(raw);
  } catch {
    response = respond('ask', 'Falha inesperada ao ler o payload do hook.');
  }
  process.stdout.write(JSON.stringify(response));
  process.exitCode = 0;
}

main();
