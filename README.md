# STOVE Actions

GitHub Actions for deploying game builds to the [STOVE Store](https://store.onstove.com):

- [`upload`](upload/README.md) — upload a build to STOVE Studio with the official STOVE Uploader CLI.

Each action folder has its own README with the full input/output reference; the section below is
an overview.

## Upload

The `upload` action downloads the official [STOVE Uploader CLI](https://studiodocs.onstove.com/build-management/uploader-cli),
writes a run configuration from the workflow inputs, and uploads the given build directory to the
target product's build list in STOVE Studio.

```yaml
deploy-stove:
  runs-on: windows-latest
  steps:
    - uses: actions/download-artifact@v8
      with:
        name: Game-Windows
        path: build

    - uses: insd47/stove-actions/upload@v1
      with:
        game-id: ${{ vars.STOVE_GAME_ID }}
        source-path: build
        description: ${{ github.ref_name }} (${{ github.sha }})
        user-id: ${{ secrets.STOVE_USER_ID }}
        password: ${{ secrets.STOVE_PASSWORD }}
        caller-detail: ${{ secrets.STOVE_CALLER_DETAIL }}
```

The STOVE Uploader CLI is a Windows-only executable, so the job must run on a `windows` runner.
Uploading places the build in the product's build list; applying it to live (run settings, update
scheduling) still happens in the [STOVE Studio](https://studio.onstove.com) web console.

The `caller-detail` credential is an additional key for programmatic sign-in. Request it from
STOVE support at store.support@smilegate.com before first use. Prefer a dedicated STOVE team
account that only has access to the target product over a personal account.

## License

[MIT](LICENSE)
