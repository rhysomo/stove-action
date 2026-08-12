import * as core from '@actions/core';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface UploadInputs {
  gameId: string;
  sourcePath: string;
  description: string;
  userId: string;
  password: string;
  callerDetail: string;
  excludedFiles: string[];
  excludedExtensions: string[];
  excludedDirectories: string[];
  resumeCount: number;
  showProgress: boolean;
  cliPath: string;
  cliUrl: string;
}

export function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateDescription(description: string): string {
  if (description.length < 1 || description.length > 60) {
    throw new Error(`description must be 1-60 characters; got ${description.length}.`);
  }
  return description;
}

export function validateResumeCount(value: string): number {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`resume-count must be a non-negative integer; got "${value}".`);
  }
  return count;
}

export async function readInputs(): Promise<UploadInputs> {
  const password = core.getInput('password', { required: true });
  const callerDetail = core.getInput('caller-detail', { required: true });
  core.setSecret(password);
  core.setSecret(callerDetail);

  const sourcePath = resolve(core.getInput('source-path', { required: true }));
  const source = await stat(sourcePath).catch(() => null);
  if (!source?.isDirectory()) {
    throw new Error(`source-path is not a directory: ${sourcePath}`);
  }

  return {
    gameId: core.getInput('game-id', { required: true }),
    sourcePath,
    description: validateDescription(core.getInput('description', { required: true })),
    userId: core.getInput('user-id', { required: true }),
    password,
    callerDetail,
    excludedFiles: splitList(core.getInput('excluded-files')),
    excludedExtensions: splitList(core.getInput('excluded-extensions')),
    excludedDirectories: splitList(core.getInput('excluded-directories')),
    resumeCount: validateResumeCount(core.getInput('resume-count') || '3'),
    showProgress: core.getBooleanInput('show-progress'),
    cliPath: core.getInput('cli-path'),
    cliUrl: core.getInput('cli-url', { required: true }),
  };
}
