# STOVE Build Upload

Uploads a game build to STOVE Studio using the official
[STOVE Uploader CLI](https://studiodocs.onstove.com/build-management/uploader-cli).

The action downloads the CLI archive (or uses a pre-installed copy), generates a run
configuration file from the inputs, runs the upload, and removes the configuration file
afterwards. On success it exposes the STOVE Studio build management URL printed by the CLI.

## Requirements

- A `windows` runner — the STOVE Uploader CLI is a Windows-only executable.
- A STOVE account with access to the target product.
- A `caller-detail` key, issued per account by STOVE support (store.support@smilegate.com).

## Usage

```yaml
- uses: insd47/stove-actions/upload@v1
  with:
    game-id: ${{ vars.STOVE_GAME_ID }}
    source-path: build/Windows
    description: ${{ github.ref_name }} (${{ github.sha }})
    user-id: ${{ secrets.STOVE_USER_ID }}
    password: ${{ secrets.STOVE_PASSWORD }}
    caller-detail: ${{ secrets.STOVE_CALLER_DETAIL }}
    excluded-extensions: pdb, log
```

## Inputs

| Name                   | Required | Default               | Description                                                          |
| ---------------------- | -------- | --------------------- | -------------------------------------------------------------------- |
| `game-id`              | yes      |                       | STOVE game ID of the target product.                                 |
| `source-path`          | yes      |                       | Directory containing the build to upload.                            |
| `description`          | yes      |                       | Build description shown in STOVE Studio (1-60 characters).           |
| `user-id`              | yes      |                       | STOVE account email.                                                 |
| `password`             | yes      |                       | STOVE account password.                                              |
| `caller-detail`        | yes      |                       | Caller-detail key issued by STOVE support.                           |
| `excluded-files`       | no       |                       | Comma-separated file names to exclude.                               |
| `excluded-extensions`  | no       |                       | Comma-separated extensions (without dot) to exclude.                 |
| `excluded-directories` | no       |                       | Comma-separated directory names to exclude.                          |
| `resume-count`         | no       | `3`                   | Automatic resume attempts on interrupted uploads.                    |
| `show-progress`        | no       | `false`               | Show the CLI progress bar in the log.                                |
| `cli-path`             | no       |                       | Pre-installed `STOVEUploaderCLI.exe` (or a directory containing it). |
| `cli-url`              | no       | official download URL | Download URL of the STOVE Uploader CLI archive.                      |

## Outputs

| Name         | Description                                                      |
| ------------ | ---------------------------------------------------------------- |
| `studio-url` | STOVE Studio build management URL printed by the CLI on success. |

## Notes

- Uploading only places the build in the product's build list. Applying it to live — run
  settings and update scheduling — happens in the STOVE Studio web console.
- File names in the build must not contain Korean characters, spaces, or special characters
  (a STOVE platform restriction).
- The CLI refuses reserved names such as `DRMChecker.dll` and `combinedata_manifest`; these are
  produced by STOVE tooling and should not be present in a clean build.
- Store `user-id`, `password`, and `caller-detail` as encrypted secrets. Prefer a dedicated
  STOVE team account restricted to the target product.
