# Agent Rules

## Operational Commands

저장소 루트에서 실행한다. 명령 정의는 [package.json](package.json:6)을 기준으로 한다.

- 전체 검사: `bun run lint`, `bun run build`, `bun run test`.
- 프론트엔드 테스트: `bun run test -- src/components/PromptInput.test.tsx`.
- 서버 순수 함수 테스트: `bun run test -- server/generator.test.ts server/fallback.test.ts`.
- 통합 실행은 [README.md](README.md)의 실행 방법을 따른다. API만 실행하려면 `bun run server`, 빌드 결과 확인은 `bun run preview`.
- Bun을 사용할 수 없으면 검사 스크립트는 `npm run lint`, `npm run build`, `npm test`로 실행할 수 있다. API 실행에는 Bun이 필요하다. 검사를 위해 다른 패키지 관리자의 잠금 파일을 추가하지 않는다.
- `bun test`로 대체하지 않는다. 테스트 스크립트는 Vitest이며 jsdom과 공통 setup을 사용한다. 근거: [package.json](package.json:12), [vite.config.ts](vite.config.ts:16).

## Golden Rules

- 서버 환경변수의 실제 키를 클라이언트 응답·번들에 노출하지 않는다. `/api/config`의 `envKeys`는 키 존재 여부만 전달하는 계약이다. 근거: [server/index.ts](server/index.ts:59), [server/index.ts](server/index.ts:147), [src/App.tsx](src/App.tsx:18).
- Provider를 추가하거나 바꿀 때 클라이언트 타입·선택 UI·서버 분기·키 조회를 함께 확인한다. UI 기본값은 Google, provider 생략 시 서버 기본값은 Anthropic이므로 동일하다고 가정하지 않는다. 근거: [src/types/index.ts](src/types/index.ts:1), [src/App.tsx](src/App.tsx:17), [server/index.ts](server/index.ts:57), [server/index.ts](server/index.ts:161).
- 생성 결과는 `code` 문자열, 실패는 `error` 문자열로 전달하는 계약을 유지한다. 클라이언트는 상태 코드로 성공 여부를 판별한다. 근거: [server/index.ts](server/index.ts:188), [server/index.ts](server/index.ts:208), [src/hooks/useComponentGenerator.ts](src/hooks/useComponentGenerator.ts:23).
- `build` 성공을 서버 전체 타입 검증이나 API 통합 검증으로 보고하지 않는다. TypeScript 프로젝트의 include는 `src`와 `vite.config.ts`이며, 기존 서버 테스트는 순수 함수만 직접 가져온다. 근거: [tsconfig.app.json](tsconfig.app.json:27), [tsconfig.node.json](tsconfig.node.json:25), [server/generator.test.ts](server/generator.test.ts:2), [server/fallback.test.ts](server/fallback.test.ts:2).

## TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

### 적용 기준과 우선순위

이 섹션은 **전역 기본값(fallback)**이다. 하위 디렉토리 `AGENTS.md`에 별도 TDD 규칙이 있으면 **해당 규칙을 우선**한다.

- **TDD 필수:** 비즈니스 로직, API, 유틸리티, 버그 수정. 버그 수정은 재현 테스트를 먼저 작성한다.
- **TDD 불필요:** 타입 정의, 설정 파일, 동작 로직 없는 순수 UI(마크업·스타일), SQL.
- 제외 대상에 동작 로직 변경이 섞이면 **그 동작에는 TDD를 적용**한다. TDD 제외는 기존 검사 생략을 뜻하지 않는다.

### RED-GREEN-REFACTOR

1. **RED**
   - **하나의 동작 = 하나의 테스트**로 기대 결과를 작성한다.
   - 프로덕션 코드 작성 전에 **반드시 테스트를 실행해 실패를 확인**한다.
   - 실패 이유는 **기능 미구현**이어야 한다. 버그 수정은 기대 동작의 미구현을 재현한다. 구문 오류·의존성 누락·테스트 설정 오류는 RED로 인정하지 않으며, 원인을 해결하고 다시 실행한다.
2. **GREEN**
   - 실패한 테스트를 통과시키는 **최소한의 코드만 작성**한다.
   - **YAGNI:** 요구되지 않은 기능·추상화·확장 지점을 추가하지 않는다.
   - **신규 테스트와 기존 테스트 모두 통과**했는지 실행해 확인한다.
3. **REFACTOR**
   - 중복 제거, 이름 개선, 헬퍼 추출로 구조를 정리한다.
   - 변경 후 테스트를 실행해 **GREEN을 유지**한다. 실패하면 먼저 복구한다.
   - **새 동작 추가 금지.** 필요하면 다음 사이클로 분리한다.
4. **반복:** 다음 동작에 대한 **RED로 돌아간다.**

### 삭제 강제 규칙

- TDD 필수 대상에서 테스트보다 프로덕션 코드를 먼저 작성했다면 **그 선작성 코드를 삭제하고 RED부터 재시작**한다.
- **“참고용”으로 남기는 것도 금지**한다. 주석·별도 파일에 보관하거나 복사해 재사용하지 않는다.
- 삭제 대상은 **이번 작업에서 테스트 전에 선작성한 코드**다. 기존 코드나 다른 사람의 변경을 삭제하지 않는다.

### 변명 차단표

| 변명 | 반론 |
| --- | --- |
| “너무 단순해서 테스트 불필요” | **단순함은 면제 사유가 아니다.** 적용 기준에 해당하면 작은 테스트부터 작성한다. |
| “나중에 추가하겠다” | 사후 테스트는 선행 실패를 증명하지 못한다. **지금 RED부터 시작한다.** |
| “시간이 없다” | 절차를 생략하지 말고 **구현할 동작의 범위를 줄인다.** |
| “삭제하면 낭비” | 선작성 코드는 절차 위반이다. **삭제하고 검증 가능한 구현으로 다시 작성한다.** |
| “프로토타입이다” | 프로토타입도 적용 기준이 같다. **이름으로 예외를 만들지 않는다.** |

## Project Context

제품 목표와 기술 스택은 [README.md](README.md)를 참조한다. 에이전트의 변경 완료 기준은 생성 요청부터 실행 가능한 미리보기·코드 확인까지의 계약을 유지하는 것이다.

## Standards & References

- 회사 정책: API 키·비밀번호 하드코딩 금지, 외부 API 호출은 HTTPS 필수, `.env` 커밋 금지. 현재 외부 호출 근거: [server/index.ts](server/index.ts:69), [server/index.ts](server/index.ts:99); 제외 설정: [.gitignore](.gitignore:32).
- 모든 코드 변경은 린트를 통과해야 한다. 변경 범위에 필요한 테스트·빌드도 실행하고, 실행하지 못한 검사는 명시한다.
- 커밋 요청은 [commit 스킬](.agents/skills/commit/SKILL.md)을 따른다. 한국어 Conventional Commits 형식으로 논리적 단위별 커밋하며 추가 승인은 요구하지 않는다. 별도 요청 없이 push나 이력 재작성을 수행하지 않는다.
- 기존 작업 변경을 보존하고 요청 범위만 수정한다. 문서 생성 요청만으로 커밋하지 않는다.
- Maintenance Policy: 규칙과 코드의 괴리가 발생하면 업데이트를 제안한다. 인용한 파일·라인은 규칙 수정 시 다시 확인하고, 근거 없는 규칙을 추가하지 않는다. 각 AGENTS.md는 500라인 미만으로 유지한다.

## Context Map

- **[UI·상태·미리보기 수정](src/AGENTS.md)** — 브라우저 코드 및 인터랙션 검증 시 적용한다.
- **[AI 호출·응답 정규화 수정](server/AGENTS.md)** — Bun API와 모델 폴백 로직 변경 시 적용한다.
