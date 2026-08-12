import * as core from '@actions/core';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveCli } from './cli.js';
import { runConfig } from './config.js';
import { readInputs } from './input.js';
import { failureMessage, runCli } from './run.js';

async function main(): Promise<void> {
  if (process.platform !== 'win32') {
    throw new Error('The STOVE Uploader CLI only runs on Windows; run this action on a windows runner.');
  }

  const inputs = await readInputs();
  const exe = await core.group('Prepare STOVE Uploader CLI', () => resolveCli(inputs.cliPath, inputs.cliUrl));
  core.info(`Using CLI at ${exe}`);

  const configPath = join(process.env.RUNNER_TEMP ?? tmpdir(), `stove-upload-config-${process.pid}.yaml`);
  await writeFile(configPath, runConfig(inputs), 'utf8');
  try {
    const started = Date.now();
    const { code, studioUrl } = await runCli(exe, configPath);
    if (code !== 0) throw new Error(failureMessage(code));

    const minutes = ((Date.now() - started) / 60_000).toFixed(1);
    core.info(`Upload finished in ${minutes} min.`);
    if (studioUrl) {
      core.setOutput('studio-url', studioUrl);
      core.info(`Build management page: ${studioUrl}`);
    }

    core.summary
      .addHeading('STOVE upload', 3)
      .addRaw(`Uploaded \`${inputs.sourcePath}\` to game \`${inputs.gameId}\` in ${minutes} min.`, true);
    if (studioUrl) core.summary.addRaw(`\n\n[Open build management](${studioUrl})`, true);
    await core.summary.write();
  } finally {
    await rm(configPath, { force: true });
  }
}

main().catch((error: unknown) => core.setFailed(error instanceof Error ? error.message : String(error)));
