import { spawn } from 'node:child_process';

// Error codes documented in the STOVE Uploader CLI user guide
// (https://studiodocs.onstove.com/build-management/uploader-cli).
const ERROR_HINTS: Record<number, string> = {
  10100: 'sign-in API call failed — check user-id and password',
  10101: 'sign-in retry limit exceeded',
  10102: 'abnormal sign-in response — retry is not possible',
  10103: 'user id or password missing',
};

export function failureMessage(code: number): string {
  const hint =
    ERROR_HINTS[code] ?? (code >= 10400 && code <= 10404 ? 'token refresh failed — check caller-detail' : null);
  return hint
    ? `STOVE Uploader CLI exited with code ${code}: ${hint}.`
    : `STOVE Uploader CLI exited with code ${code}.`;
}

const STUDIO_URL_PATTERN = /https:\/\/[^\s"']*onstove\.com[^\s"']*/;

export function matchStudioUrl(line: string): string | undefined {
  return STUDIO_URL_PATTERN.exec(line)?.[0];
}

export interface RunResult {
  code: number;
  studioUrl: string | undefined;
}

export function runCli(exe: string, configPath: string): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(exe, ['-c', configPath], { stdio: ['ignore', 'pipe', 'inherit'] });
    let studioUrl: string | undefined;
    let tail = '';

    child.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk);
      const lines = (tail + chunk.toString()).split(/\r?\n/);
      tail = lines.pop() ?? '';
      for (const line of lines) studioUrl ??= matchStudioUrl(line);
    });

    child.on('error', reject);
    child.on('close', (code) => {
      studioUrl ??= matchStudioUrl(tail);
      resolve({ code: code ?? 1, studioUrl });
    });
  });
}
