import { readdir } from 'node:fs/promises';
import type { UploadExclusions } from './config.js';

const fileNames = ['steam_api.dll', 'steam_api64.dll', 'Steamworks.NET.txt', 'steam_appid.txt'];
const extensions = ['pdb'];
const unityDirectorySuffixes = ['_BurstDebugInformation_DoNotShip', '_BackUpThisFolder_ButDontShipItWithYourGame'];

/** 업로드 소스를 바꾸지 않고 공식 CLI에 전달할 제외 목록을 만든다. */
export async function uploadExclusions(sourcePath: string): Promise<UploadExclusions> {
  const entries = await readdir(sourcePath, { withFileTypes: true, recursive: true });
  const directoryNames = entries
    .filter((entry) => entry.isDirectory() && isUnityDoNotShipDirectory(entry.name))
    .map((entry) => entry.name);

  return {
    fileNames,
    extensions,
    directoryNames: uniqueCaseInsensitive(directoryNames),
  };
}

function isUnityDoNotShipDirectory(name: string): boolean {
  const normalized = name.toLowerCase();
  return unityDirectorySuffixes.some((suffix) => normalized.endsWith(suffix.toLowerCase()));
}

function uniqueCaseInsensitive(values: string[]): string[] {
  const unique = new Map<string, string>();

  for (const value of values) {
    unique.set(value.toLowerCase(), value);
  }

  return [...unique.values()].sort((left, right) => left.localeCompare(right));
}
