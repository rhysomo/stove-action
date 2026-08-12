import { mkdtemp, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cleanup } from '../src/cleanup.js';

describe('cleanup', () => {
  it('removes the work directory and remains safe to repeat from post', async () => {
    const workDirectory = await mkdtemp(join(tmpdir(), 'stove-upload-test-'));
    await writeFile(join(workDirectory, 'run-config.yaml'), 'secret');

    await cleanup(workDirectory);
    await cleanup(workDirectory);

    await expect(stat(workDirectory)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
