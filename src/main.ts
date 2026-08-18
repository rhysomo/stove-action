import * as core from '@actions/core';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import extract from 'extract-zip';
import { cleanup, workDirectoryState } from './cleanup.js';
import { runConfig, type Upload } from './config.js';
import { uploadExclusions } from './exclusions.js';

const cliUrl = 'https://dl-sgvn.onstove.com/tools/UploadTool/STOVEUploaderCLI.zip';

async function main(): Promise<void> {
  if (process.platform !== 'win32') {
    throw new Error('The STOVE Uploader CLI only runs on Windows; run this action on a windows runner.');
  }

  const upload: Upload = {
    gameId: core.getInput('game-id', { required: true }),
    sourcePath: resolve(core.getInput('source-path', { required: true })),
    description: core.getInput('description', { required: true }),
    userId: core.getInput('user-id', { required: true }),
    password: core.getInput('password', { required: true, trimWhitespace: false }),
    callerDetail: core.getInput('caller-detail', { required: true, trimWhitespace: false }),
  };

  core.setSecret(upload.userId);
  core.setSecret(upload.password);
  core.setSecret(upload.callerDetail);

  if (upload.description.length > 60) {
    throw new Error(`description must be at most 60 characters; got ${upload.description.length}.`);
  }

  const source = await stat(upload.sourcePath).catch(() => null);
  if (!source?.isDirectory()) {
    throw new Error(`source-path is not a directory: ${upload.sourcePath}`);
  }

  const workDirectory = await mkdtemp(join(process.env.RUNNER_TEMP ?? tmpdir(), 'stove-upload-'));

  try {
    core.saveState(workDirectoryState, workDirectory);

    const executable = await core.group('Prepare STOVE Uploader CLI', async () => {
      const archive = join(workDirectory, 'STOVEUploaderCLI.zip');
      const response = await fetch(cliUrl);

      if (!response.ok) {
        throw new Error(`STOVE Uploader CLI download failed with HTTP ${response.status}.`);
      }

      await writeFile(archive, Buffer.from(await response.arrayBuffer()));

      const extracted = join(workDirectory, 'cli');
      await extract(archive, { dir: extracted });

      const entries = await readdir(extracted, { withFileTypes: true, recursive: true });
      const entry = entries.find(
        (candidate) => candidate.isFile() && candidate.name.toLowerCase() === 'stoveuploadercli.exe',
      );

      if (!entry) {
        throw new Error('STOVEUploaderCLI.exe was not found in the downloaded archive.');
      }

      return join(entry.parentPath, entry.name);
    });

    const config = join(workDirectory, 'run-config.yaml');
    const exclusions = await uploadExclusions(upload.sourcePath);
    await writeFile(config, runConfig(upload, exclusions), { encoding: 'utf8', mode: 0o600 });

    const child = spawn(executable, ['-c', config], { stdio: 'inherit' });
    const [code] = (await once(child, 'close')) as [number | null];
    if (code !== 0) {
      throw new Error(`STOVE Uploader CLI exited with code ${code ?? 'unknown'}.`);
    }
  } finally {
    await cleanup(workDirectory);
  }
}

main().catch((error: unknown) => core.setFailed(error instanceof Error ? error : String(error)));
