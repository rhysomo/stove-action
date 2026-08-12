import { rm } from 'node:fs/promises';

export const workDirectoryState = 'workDirectory';

export async function cleanup(workDirectory: string): Promise<void> {
  if (!workDirectory) return;

  await rm(workDirectory, { recursive: true, force: true });
}
