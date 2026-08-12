import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findExe } from '../src/cli.js';

async function tempTree(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'stove-cli-test-'));
}

describe('findExe', () => {
  it('finds the CLI executable in a nested versioned directory', async () => {
    const root = await tempTree();
    const nested = join(root, 'STOVEUploaderCLI_v0.1.8.0');
    await mkdir(nested, { recursive: true });
    await writeFile(join(nested, 'STOVEUploaderCLI.exe'), '');
    expect(await findExe(root)).toBe(join(nested, 'STOVEUploaderCLI.exe'));
  });

  it('matches the executable name case-insensitively', async () => {
    const root = await tempTree();
    await writeFile(join(root, 'stoveuploadercli.EXE'), '');
    expect(await findExe(root)).toBe(join(root, 'stoveuploadercli.EXE'));
  });

  it('returns null when the executable is absent', async () => {
    const root = await tempTree();
    await writeFile(join(root, 'readme.txt'), '');
    expect(await findExe(root)).toBeNull();
  });
});
