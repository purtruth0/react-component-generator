# Server Agent Rules

## Module Context

Bun HTTP API에서 공급자별 AI 호출을 수행하고 결과를 react-live용 코드로 정규화한다. 브라우저로 반환하는 데이터 계약은 루트 규칙을 따른다.

## Tech Stack & Constraints

Bun 런타임, TypeScript, fetch, Vitest. `index.ts`는 import 시 `Bun.serve`를 실행하므로 Node/jsdom 테스트에서 순수 유틸리티처럼 가져오지 않는다. 근거: [index.ts](index.ts:138), [../vite.config.ts](../vite.config.ts:17).

## Implementation Patterns

- 응답 정규화는 `generator.ts`, 순차 모델 시도는 주입된 `attempt`를 받는 `fallback.ts`에 유지해 HTTP 서버와 분리한다. 근거: [generator.ts](generator.ts:5), [fallback.ts](fallback.ts:3).
- API 포트를 변경하면 Vite `/api` 프록시 대상도 함께 변경한다. 근거: [index.ts](index.ts:139), [../vite.config.ts](../vite.config.ts:11).

## Testing Strategy

- 루트에서 `bun run test -- server/generator.test.ts server/fallback.test.ts`를 실행한다. Bun이 없으면 `npm test -- server/generator.test.ts server/fallback.test.ts`.
- 정규화는 기존 render 보존·선언별 주입·대상 없는 입력을, 폴백은 첫 성공 종료·다음 모델 시도·최종 오류·빈 목록을 검증한다. 근거: [generator.test.ts](generator.test.ts:20), [fallback.test.ts](fallback.test.ts:4).
- 이 테스트는 실서버·인증·공급자 네트워크 호출을 검증하지 않는다. 라우트나 공급자 응답 처리를 바꾸면 별도 모킹 또는 Bun 기반 확인이 필요하다. 근거: [generator.test.ts](generator.test.ts:2), [fallback.test.ts](fallback.test.ts:2), [index.ts](index.ts:159).

## Local Golden Rules

- 생성 결과는 import·TypeScript 구문·CSS import 없이 자체 완결된 JavaScript/JSX여야 한다. 시스템 프롬프트의 인라인 스타일·명시적 render 조건을 유지한다. 근거: [index.ts](index.ts:10), [index.ts](index.ts:20), [../src/components/LivePreview.tsx](../src/components/LivePreview.tsx:14).
- 시스템 프롬프트만 신뢰해 코드펜스 제거와 render 보정을 삭제하지 않는다. 정규화 순서는 `ensureRenderCall(stripCodeFences(text))`이다. 이는 보안 샌드박스나 코드 안전성 검증이 아니다. 근거: [index.ts](index.ts:16), [index.ts](index.ts:188), [generator.ts](generator.ts:5), [generator.ts](generator.ts:16).
- Google 경로의 `MAX_TOKENS` 검사는 잘린 코드를 성공 결과로 반환하지 않게 한다. Anthropic 경로에 같은 응답 필드가 있다고 가정하지 않는다. 근거: [index.ts](index.ts:88), [index.ts](index.ts:122).
- Google 모델 목록은 우선순위가 있으며 실패 시 순차 시도한다. 첫 성공 즉시 종료하고 전부 실패하면 마지막 오류를 전달한다. 병렬 실행이나 무한 재시도로 바꾸지 않는다. 현재 이 폴백은 Google에만 적용된다. 근거: [index.ts](index.ts:5), [index.ts](index.ts:134), [fallback.ts](fallback.ts:7), [fallback.test.ts](fallback.test.ts:27).
- 키 선택은 요청에 전달된 키가 서버 환경변수보다 우선한다. 클라이언트 키 누락 안내와 별개로 서버의 키·프롬프트 검사를 유지한다. 근거: [index.ts](index.ts:64), [index.ts](index.ts:167), [index.ts](index.ts:176), [../src/App.tsx](../src/App.tsx:25).
- 공급자 오류를 바꿀 때 503·429의 한국어 오류 응답과 상태 코드를 확인한다. 그 외 오류는 500으로 반환하는 현재 구분을 무심코 깨지 않는다. 근거: [index.ts](index.ts:194), [index.ts](index.ts:201), [index.ts](index.ts:208).
