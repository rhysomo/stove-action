import { describe, expect, it } from 'vitest';
import { runConfig, type Upload } from '../src/config.js';

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

    expect(JSON.parse(runConfig(upload))).toEqual({
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
    });
  });
});
