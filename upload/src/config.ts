import type { UploadInputs } from './input.js';

// The CLI reads the run config with a YAML parser, and JSON is a YAML subset;
// serializing with JSON.stringify avoids hand-rolled YAML escaping of
// credentials that may contain quotes or other special characters.
export function runConfig(inputs: UploadInputs): string {
  const config: Record<string, unknown> = {
    build_info: {
      game_id: inputs.gameId,
      source: inputs.sourcePath,
      description: inputs.description,
    },
    credential: {
      user_id: inputs.userId,
      password: inputs.password,
      caller_detail: inputs.callerDetail,
    },
    display_setting: {
      hide_progress: !inputs.showProgress,
      hide_logs: false,
    },
    option: {
      resume_count: inputs.resumeCount,
    },
  };

  const excluded: Record<string, string[]> = {};
  if (inputs.excludedFiles.length) excluded.excluded_file_list = inputs.excludedFiles;
  if (inputs.excludedExtensions.length) excluded.excluded_extension_list = inputs.excludedExtensions;
  if (inputs.excludedDirectories.length) excluded.excluded_directory_list = inputs.excludedDirectories;
  if (Object.keys(excluded).length) config.excluded_setting = excluded;

  return JSON.stringify(config, null, 2);
}
