import { describe, expect, it } from 'vitest';
import { runConfig, type Upload, type UploadExclusions } from '../src/config.js';

describe('runConfig', () => {
  it('writes only the required STOVE CLI fields without changing credential text', () => {
    const upload: Upload = {
      gameId: 'revive',
      sourcePath: 'C:\\build\\Windows',
      description: 'v1.2.3 (abc1234)',
      userId: 'ci@example.com',
      password: 'p@ss"word\'with:specials\n',
      callerDetail: 'caller-key',
    };

    const exclusions: UploadExclusions = {
      fileNames: ['steam_api64.dll'],
      extensions: ['pdb'],
      directoryNames: ['REVIVE_BurstDebugInformation_DoNotShip'],
    };

    expect(JSON.parse(runConfig(upload, exclusions))).toEqual({
      build_info: {
        game_id: 'revive',
        source: 'C:\\build\\Windows',
        description: 'v1.2.3 (abc1234)',
      },
      credential: {
        user_id: 'ci@example.com',
        password: upload.password,
        caller_detail: 'caller-key',
      },
      excluded_setting: {
        excluded_file_list: exclusions.fileNames,
        excluded_extension_list: exclusions.extensions,
        excluded_directory_list: exclusions.directoryNames,
      },
    });
  });
});
