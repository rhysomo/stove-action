/** CLI config를 escape-safe한 YAML-compatible JSON으로 직렬화한다. */
export function runConfig(upload: Upload, exclusions: UploadExclusions): string {
  return JSON.stringify(
    {
      build_info: {
        game_id: upload.gameId,
        source: upload.sourcePath,
        description: upload.description,
      },
      credential: {
        user_id: upload.userId,
        password: upload.password,
        caller_detail: upload.callerDetail,
      },
      excluded_setting: {
        excluded_file_list: exclusions.fileNames,
        excluded_extension_list: exclusions.extensions,
        excluded_directory_list: exclusions.directoryNames,
      },
    },
    null,
    2,
  );
}

export interface Upload {
  gameId: string;
  sourcePath: string;
  description: string;
  userId: string;
  password: string;
  callerDetail: string;
}

export interface UploadExclusions {
  fileNames: string[];
  extensions: string[];
  directoryNames: string[];
}
