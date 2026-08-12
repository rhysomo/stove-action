/** CLI config를 escape-safe한 YAML-compatible JSON으로 직렬화한다. */
export function runConfig(upload: Upload): string {
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
