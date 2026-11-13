# Frontend Agent Rules

## Module Context

생성 요청 상태와 결과를 관리하고 서버가 반환한 코드를 브라우저에서 실행한다. 서버와 공유하는 계약 변경은 루트 규칙을 함께 따른다.

## Tech Stack & Constraints

React 19, TypeScript 5.9, react-live 4, Testing Library, Vitest/jsdom. 의존성 범위는 [package.json](../package.json:15)을 확인한다. 앱 자체의 TypeScript와 생성 결과인 JavaScript/JSX를 구분한다.

## Implementation Patterns

- 요청·결과 목록·오류 상태 변경은 `useComponentGenerator`를 기준으로 확장한다. 목록은 최신 결과를 앞에 추가하고 날짜는 `Date`로 보관한다. 근거: [hooks/useComponentGenerator.ts](hooks/useComponentGenerator.ts:35), [types/index.ts](types/index.ts:3).
- 시각 토큰은 [App.css](App.css:1), 전역 초기화·키보드 포커스는 [index.css](index.css:1)를 기준으로 수정한다. 생성 컴포넌트의 인라인 스타일과 호스트 앱의 스타일을 구분한다.

## Testing Strategy

- 루트에서 `bun run test -- src/components/PromptInput.test.tsx`를 실행한다. Bun이 없으면 `npm test -- src/components/PromptInput.test.tsx`.
- 기존 테스트는 `userEvent`와 접근 가능한 역할로 입력·생성 동작을 검증한다. 공통 setup이 각 테스트 후 DOM을 정리한다. 근거: [components/PromptInput.test.tsx](components/PromptInput.test.tsx:12), [test/setup.ts](test/setup.ts:5).
- 현재 자동 테스트 범위는 PromptInput 중심이다. 전체 생성·삭제·재생성·클립보드 동작까지 검증됐다고 보고하지 않는다. 관련 변경 시 해당 동작을 별도로 확인한다. 근거: [components/PromptInput.test.tsx](components/PromptInput.test.tsx:6), [hooks/useComponentGenerator.ts](hooks/useComponentGenerator.ts:18), [components/CodeView.tsx](components/CodeView.tsx:10).
- CSS 검증은 자동 테스트에 포함되지 않는다. 레이아웃 수정 시 데스크톱·모바일을 확인하고 키보드 포커스·모션 감소 처리를 유지한다. 근거: [../vite.config.ts](../vite.config.ts:19), [App.css](App.css:106), [App.css](App.css:108), [index.css](index.css:9).

## Local Golden Rules

- `LiveProvider`의 `noInline`과 서버의 명시적 `render(...)` 계약을 함께 유지한다. 생성 코드 실행 오류는 `LiveError`로 표시한다. 근거: [components/LivePreview.tsx](components/LivePreview.tsx:14), [../server/generator.ts](../server/generator.ts:16).
- 미리보기 새로고침은 key를 바꿔 리마운트하는 동작이고, 재생성은 동일 프롬프트로 API를 다시 호출하는 동작이다. 두 동작을 합치지 않는다. 근거: [components/ComponentCard.tsx](components/ComponentCard.tsx:33), [components/ComponentCard.tsx](components/ComponentCard.tsx:41), [components/ComponentCard.tsx](components/ComponentCard.tsx:70).
- 빈 프롬프트·로딩 중 제출 방어는 버튼 비활성화와 제출 핸들러 양쪽에 유지한다. 키보드 단축키도 같은 핸들러를 호출한다. 근거: [components/PromptInput.tsx](components/PromptInput.tsx:21), [components/PromptInput.tsx](components/PromptInput.tsx:33).
- API 키를 저장소·localStorage에 영속화하지 않는다. Provider 전환 시 입력 키·노출 상태를 초기화하는 흐름을 유지한다. 근거: [App.tsx](App.tsx:14), [App.tsx](App.tsx:49), [App.tsx](App.tsx:51).
