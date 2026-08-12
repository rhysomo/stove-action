import { describe, expect, it } from 'vitest';
import { failureMessage, matchStudioUrl } from '../src/run.js';

describe('failureMessage', () => {
  it('maps documented sign-in error codes to hints', () => {
    expect(failureMessage(10100)).toContain('user-id and password');
    expect(failureMessage(10101)).toContain('retry limit');
  });

  it('maps the token refresh code range to a caller-detail hint', () => {
    expect(failureMessage(10400)).toContain('caller-detail');
    expect(failureMessage(10404)).toContain('caller-detail');
  });

  it('falls back to the bare exit code for unknown codes', () => {
    expect(failureMessage(1)).toBe('STOVE Uploader CLI exited with code 1.');
  });
});

describe('matchStudioUrl', () => {
  it('extracts an onstove.com URL from a log line', () => {
    expect(matchStudioUrl('Build page: https://studio.onstove.com/games/1234/builds done')).toBe(
      'https://studio.onstove.com/games/1234/builds',
    );
  });

  it('ignores lines without an onstove.com URL', () => {
    expect(matchStudioUrl('uploading chunk 3/10 to https://s3.amazonaws.com/bucket')).toBeUndefined();
    expect(matchStudioUrl('plain log line')).toBeUndefined();
  });
});
