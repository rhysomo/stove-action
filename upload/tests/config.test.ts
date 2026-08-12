import { describe, expect, it } from 'vitest';
import { runConfig } from '../src/config.js';
import type { UploadInputs } from '../src/input.js';

const base: UploadInputs = {
  gameId: 'revive',
  sourcePath: 'C:\\build\\Windows',
  description: 'v1.2.3 (abc1234)',
  userId: 'ci@example.com',
  password: 'p@ss"word\'with:specials\n',
  callerDetail: 'caller-key',
  excludedFiles: [],
  excludedExtensions: [],
  excludedDirectories: [],
  resumeCount: 3,
  showProgress: false,
  cliPath: '',
  cliUrl: 'https://example.com/cli.zip',
};

describe('runConfig', () => {
  it('emits YAML-parseable JSON with all required sections', () => {
    const parsed = JSON.parse(runConfig(base));
    expect(parsed.build_info).toEqual({
      game_id: 'revive',
      source: 'C:\\build\\Windows',
      description: 'v1.2.3 (abc1234)',
    });
    expect(parsed.credential).toEqual({
      user_id: 'ci@example.com',
      password: base.password,
      caller_detail: 'caller-key',
    });
    expect(parsed.option.resume_count).toBe(3);
  });

  it('hides progress unless show-progress is set', () => {
    expect(JSON.parse(runConfig(base)).display_setting.hide_progress).toBe(true);
    expect(JSON.parse(runConfig({ ...base, showProgress: true })).display_setting.hide_progress).toBe(false);
  });

  it('omits excluded_setting when no exclusions are given', () => {
    expect(JSON.parse(runConfig(base))).not.toHaveProperty('excluded_setting');
  });

  it('includes only the exclusion lists that are non-empty', () => {
    const parsed = JSON.parse(runConfig({ ...base, excludedExtensions: ['log', 'pdb'] }));
    expect(parsed.excluded_setting).toEqual({ excluded_extension_list: ['log', 'pdb'] });
  });
});
