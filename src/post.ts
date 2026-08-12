import * as core from '@actions/core';
import { cleanup, workDirectoryState } from './cleanup.js';

cleanup(core.getState(workDirectoryState)).catch((error: unknown) =>
  core.setFailed(error instanceof Error ? error : String(error)),
);
