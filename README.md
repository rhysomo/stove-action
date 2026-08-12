# STOVE Upload

공식 [STOVE Uploader CLI](https://studiodocs.onstove.com/build-management/uploader-cli)를 사용해
게임 빌드를 STOVE Studio에 업로드합니다.

## 사용법

```yaml
deploy-stove:
  runs-on: windows-latest
  steps:
    - uses: actions/download-artifact@v8
      with:
        name: Game-Windows
        path: build

    - uses: insd47/stove-action@v1
      with:
        game-id: ${{ vars.STOVE_GAME_ID }}
        source-path: build
        description: ${{ github.ref_name }} (${{ github.sha }})
        user-id: ${{ secrets.STOVE_USER_ID }}
        password: ${{ secrets.STOVE_PASSWORD }}
        caller-detail: ${{ secrets.STOVE_CALLER_DETAIL }}
```

## 입력값

| 이름            | 설명                                                  |
| --------------- | ----------------------------------------------------- |
| `game-id`       | 업로드 대상 게임의 STOVE 게임 ID.                     |
| `source-path`   | 업로드할 빌드가 들어 있는 디렉터리.                   |
| `description`   | STOVE Studio에 표시되는 빌드 설명 (1~60자).           |
| `user-id`       | STOVE 계정 이메일.                                    |
| `password`      | STOVE 계정 비밀번호.                                  |
| `caller-detail` | STOVE 지원팀에서 발급받은 caller-detail 키.           |

모든 입력값은 필수입니다. 이 액션은 재시도, 진행 표시, 제외 규칙 동작을 의도적으로 공식 CLI
기본값 그대로 둡니다. 여기서 별도의 제외 규칙을 관리하기보다는, 빌드 또는 패키징 단계에서
최종 업로드 내용물을 미리 준비하세요.

## 요구 사항 및 동작

- `windows` 러너를 사용하세요. STOVE Uploader CLI는 Windows 전용 실행 파일입니다.
- `caller-detail` 키는 STOVE 지원팀(store.support@smilegate.com)에 요청해 발급받으세요.
- 대상 게임에만 권한이 제한된 전용 STOVE 팀 계정 사용을 권장합니다.
- 이 액션은 CLI를 다운로드하고 인증 정보가 담긴 설정 파일을 `RUNNER_TEMP` 아래에 기록합니다.
  업로드가 끝나면 해당 실행 전용 디렉터리를 삭제하며, 잡 종료 시 `runs.post`에서 동일한
  멱등 정리를 다시 수행합니다.
- 업로드하면 빌드가 게임의 빌드 목록에 등록됩니다. 라이브 적용은 여전히
  [STOVE Studio](https://studio.onstove.com) 웹 콘솔에서 해야 합니다.
- 빌드 내 파일 이름에는 한글, 공백, 특수문자를 사용할 수 없습니다.
- `DRMChecker.dll`, `combinedata_manifest` 등 STOVE가 생성하는 예약된 이름은 클린 빌드에
  포함하지 마세요.

## 라이선스

[MIT](LICENSE)
