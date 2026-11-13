import { useRef, useState } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  { label: '대시보드 카드', icon: '▦', prompt: 'SaaS 관리자용 KPI 카드 3개. 매출, 활성 사용자, 전환율을 비교 가능한 형태로 표시' },
  { label: '알림 설정', icon: '☷', prompt: '설정 페이지의 알림 토글 패널. 이메일, 슬랙, 주간 리포트 옵션 포함' },
  { label: '검색 필터', icon: '⌕', prompt: '검색 필터 바. 상태, 담당자, 날짜 범위를 선택하고 결과 수를 보여주는 UI' },
  { label: '체크리스트', icon: '☑', prompt: '온보딩 체크리스트. 5단계 진행률과 완료/대기 상태를 보여주는 카드' },
  { label: '요금제 비교', icon: '▥', prompt: '요금제 비교 카드 3개. 추천 플랜을 강조하고 CTA 버튼 포함' },
  { label: '고객 상세', icon: '▤', prompt: '테이블 행 상세보기 패널. 선택한 고객의 기본 정보와 최근 활동 표시' },
];

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) onGenerate(prompt.trim());
  };

  return (
    <div className="prompt-section">
      <div className="window-bar"><span><span aria-hidden="true">▤</span> 새 컴포넌트</span><span className="window-grip" aria-hidden="true" /></div>
      <div className="composer-body">
        <div className="prompt-heading"><h2>어떤 UI를 만들까요?</h2><p>아이디어를 적으면, 바로 쓸 수 있는 React 컴포넌트로.</p></div>
        <form onSubmit={handleSubmit} className="prompt-form">
          <label className="sr-only" htmlFor="component-prompt">만들고 싶은 컴포넌트</label>
          <textarea id="component-prompt" ref={inputRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="예: 음악 플레이어를 만들어줘. 앨범 커버와 재생 버튼, 진행 표시줄이 필요해." className="prompt-textarea" rows={4} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e); }} />
          <div className="prompt-toolbar"><span className="keyboard-hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> 로 생성 <span className="mac-hint"> / Mac은 ⌘</span></span><button type="submit" className="btn-generate" disabled={!prompt.trim() || isLoading}>{isLoading ? <span className="loading-spinner">생성 중...</span> : '컴포넌트 생성'}</button></div>
        </form>
        <div className="prompt-examples"><span className="examples-label">시작이 막막하다면</span><div className="example-list">{EXAMPLES.map((example) => <button key={example.label} className={`example-chip ${prompt === example.prompt ? 'example-chip--selected' : ''}`} aria-pressed={prompt === example.prompt} onClick={() => { setPrompt(example.prompt); inputRef.current?.focus(); }} type="button"><span aria-hidden="true">{example.icon}</span>{example.label}</button>)}</div></div>
      </div>
    </div>
  );
}
