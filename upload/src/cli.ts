import { createWriteStream } from 'node:fs';
import { mkdtemp, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import extract from 'extract-zip';

const EXE_NAME = 'stoveuploadercli.exe';

export async function findExe(root: string): Promise<string | null> {
  const entries = await readdir(root, { withFileTypes: true, recursive: true });
  const hit = entries.find((entry) => entry.isFile() && entry.name.toLowerCase() === EXE_NAME);
  return hit ? join(hit.parentPath, hit.name) : null;
}

export async function resolveCli(cliPath: string, cliUrl: string): Promise<string> {
  if (cliPath) {
    const target = resolve(cliPath);
    const targetStat = await stat(target);
    if (targetStat.isFile()) return target;
    const exe = await findExe(target);
    if (!exe) throw new Error(`STOVEUploaderCLI.exe not found under ${target}.`);
    return exe;
  }

  const workDir = await mkdtemp(join(process.env.RUNNER_TEMP ?? tmpdir(), 'stove-cli-'));
  const zipPath = join(workDir, 'STOVEUploaderCLI.zip');
  const response = await fetch(cliUrl);
  if (!response.ok || !response.body) {
    throw new Error(`STOVE Uploader CLI download failed: HTTP ${response.status} from ${cliUrl}`);
  }
  await pipeline(Readable.fromWeb(response.body as WebReadableStream), createWriteStream(zipPath));

  const extractDir = join(workDir, 'cli');
  await extract(zipPath, { dir: extractDir });
  const exe = await findExe(extractDir);
  if (!exe) throw new Error('STOVEUploaderCLI.exe not found in the downloaded archive.');
  return exe;
}
