import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { uploadExclusions } from '../src/exclusions.js';

describe('uploadExclusions', () => {
  it('discovers Unity DoNotShip directories and keeps store exclusions stable', async () => {
    const sourcePath = await mkdtemp(join(tmpdir(), 'stove-exclusions-test-'));

    try {
      await mkdir(join(sourcePath, 'REVIVE_BurstDebugInformation_DoNotShip'));
      await mkdir(join(sourcePath, 'nested', 'revive_burstdebuginformation_donotship'), {
        recursive: true,
      });
      await mkdir(join(sourcePath, 'REVIVE_BackUpThisFolder_ButDontShipItWithYourGame'));
      await mkdir(join(sourcePath, 'keep'));

      await expect(uploadExclusions(sourcePath)).resolves.toEqual({
        fileNames: ['steam_api.dll', 'steam_api64.dll', 'Steamworks.NET.txt', 'steam_appid.txt'],
        extensions: ['pdb'],
        directoryNames: ['REVIVE_BackUpThisFolder_ButDontShipItWithYourGame', 'revive_burstdebuginformation_donotship'],
      });
    } finally {
      await rm(sourcePath, { recursive: true, force: true });
    }
  });
});
