import { describe, expect, it } from 'vitest';
import { splitList, validateDescription, validateResumeCount } from '../src/input.js';

describe('splitList', () => {
  it('splits on commas and trims whitespace', () => {
    expect(splitList(' log, temp ,cache')).toEqual(['log', 'temp', 'cache']);
  });

  it('drops empty entries', () => {
    expect(splitList('')).toEqual([]);
    expect(splitList('log,,')).toEqual(['log']);
  });
});

describe('validateDescription', () => {
  it('accepts 1-60 characters', () => {
    expect(validateDescription('v')).toBe('v');
    expect(validateDescription('a'.repeat(60))).toHaveLength(60);
  });

  it('rejects empty and over-length descriptions', () => {
    expect(() => validateDescription('')).toThrow('1-60');
    expect(() => validateDescription('a'.repeat(61))).toThrow('1-60');
  });
});

describe('validateResumeCount', () => {
  it('parses non-negative integers', () => {
    expect(validateResumeCount('0')).toBe(0);
    expect(validateResumeCount('5')).toBe(5);
  });

  it('rejects negatives and non-integers', () => {
    expect(() => validateResumeCount('-1')).toThrow('non-negative');
    expect(() => validateResumeCount('two')).toThrow('non-negative');
    expect(() => validateResumeCount('1.5')).toThrow('non-negative');
  });
});
