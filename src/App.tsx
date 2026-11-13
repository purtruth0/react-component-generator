import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [provider, setProvider] = useState<Provider>('google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({ anthropic: false, google: false });
  const { components, isLoading, error, generate, removeComponent, clearAll } = useComponentGenerator();

  useEffect(() => {
    fetch('/api/config').then((res) => res.json()).then((data) => setEnvKeys(data.envKeys)).catch(() => {});
  }, []);
  const hasEnvKey = envKeys[provider];
  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      setKeyError(`${PROVIDER_CONFIG[provider].label} API 키를 입력한 뒤 다시 생성해 주세요.`);
      document.getElementById('api-key')?.focus();
      return;
    }
    setKeyError('');
    generate(prompt, apiKey.trim() || undefined, provider);
  };

  return (
    <div className="app">
      <header className="app-header">
        <a className="brand" href="#"><span className="brand-mark" aria-hidden="true">{'<>'}</span><span>Component Club<span className="brand-subtitle">React component workbench</span></span></a>
        <div className="header-note">작은 아이디어가 좋은 인터페이스로.</div>
        <a className="header-link" href="#results">내 작업대 <span aria-hidden="true">↗</span></a>
      </header>
      <main>
        <section className="intro" aria-labelledby="page-title"><div><h1 id="page-title">아이디어는 자유롭게.<br />컴포넌트는 손쉽게.</h1><p>설명하고, 미리 보고, 코드로 가져가세요.<br />당신의 다음 인터페이스를 만드는 작은 작업실.</p></div><div className="intro-art" aria-hidden="true"><div className="art-note">A little prompt,<br />a lot of possibility.</div><div className="art-window"><div className="art-title"><span>hello, component</span><span>▣</span></div><div className="art-code"><span>const</span> Idea = () =&gt; (<br /><b>&nbsp; &lt;SomethingGood /&gt;</b><br />);<i>✳</i></div></div><span className="art-caption">Made of ideas. Built with React.</span></div></section>
        <div className="workspace">
          <section className="composer-panel" aria-label="컴포넌트 생성"><PromptInput onGenerate={handleGenerate} isLoading={isLoading} /></section>
          <aside className="settings-panel" aria-label="실행 설정">
            <div className="window-bar window-bar--muted"><span><span aria-hidden="true">⚙</span> 연결 설정</span><span aria-hidden="true">▣</span></div>
            <div className="settings-body"><div className="settings-header"><h2>함께 만들 AI</h2><p>사용할 모델을 선택하고 연결하세요.</p></div>
              <div className="provider-select"><label htmlFor="provider">AI 제공자</label><select id="provider" value={provider} onChange={(e) => { setProvider(e.target.value as Provider); setApiKey(''); setShowKey(false); setKeyError(''); }}>{Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}</select></div>
              <div className="api-key-input"><label htmlFor="api-key">API 키</label><div className="api-key-field"><input id="api-key" type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => { setApiKey(e.target.value); setKeyError(''); }} autoComplete="off" spellCheck={false} aria-invalid={!!keyError} aria-describedby="key-status" placeholder={hasEnvKey ? '서버 키 연결됨' : PROVIDER_CONFIG[provider].placeholder} /><button className="btn-toggle-key" onClick={() => setShowKey(!showKey)} type="button" aria-label={showKey ? 'API 키 숨기기' : 'API 키 보기'} aria-pressed={showKey}>{showKey ? '숨기기' : '보기'}</button></div><p id="key-status" className={`key-status ${hasEnvKey || apiKey.trim() ? 'key-status--ready' : ''}`}><span className="status-dot" />{hasEnvKey ? '서버 키가 연결되어 있어요.' : apiKey.trim() ? '입력한 키로 생성할 준비가 됐어요.' : 'API 키를 입력하면 시작할 수 있어요.'}</p></div>
              <div className="settings-note"><span aria-hidden="true">⌑</span><p>입력한 키는 브라우저에 저장하지 않아요. 이 작업에서만 사용합니다.</p></div>
            </div>
          </aside>
        </div>
        {(error || keyError) && <div className="error-banner" role="alert"><p>{keyError || error}</p></div>}
        <section className="results-section" id="results" aria-labelledby="results-title" aria-busy={isLoading}>
          <div className="results-header"><div className="results-title"><h2 id="results-title">내 작업대</h2><span className="count-badge">{components.length}</span></div>{components.length > 0 ? <button className="btn-clear" onClick={clearAll}>전체 삭제</button> : <span className="results-hint">아이디어가 화면이 되는 곳</span>}</div>
          {components.length === 0 && !isLoading && <div className="empty-state"><div className="empty-preview" aria-hidden="true"><div className="empty-window"><span>▤</span><span>untitled.jsx</span><span>×</span></div><div className="empty-canvas"><span>{'< / >'}</span><div /><div /></div><span className="empty-cursor">↖</span></div><div className="empty-copy"><h3>아직은 빈 캔버스.</h3><p>위에 만들고 싶은 UI를 적어보세요.<br />첫 번째 컴포넌트가 여기에 나타납니다.</p><span className="empty-footnote">미리보기와 코드를 한곳에서 확인하세요.</span></div></div>}
          {isLoading && <div className="loading-card" role="status"><div className="loading-pulse" /><div><strong>아이디어를 컴포넌트로 만드는 중</strong><p>완성되면 이 작업대에 나타납니다.</p></div></div>}
          <div className="results-grid">{components.map((component) => <ComponentCard key={component.id} component={component} onRemove={removeComponent} onRegenerate={handleGenerate} isLoading={isLoading} />)}</div>
        </section>
      </main>
      <footer className="app-footer"><span>Component Club</span><p>좋은 UI는 작은 실험에서 시작됩니다.</p><span>Built with React <span aria-hidden="true">✳</span></span></footer>
    </div>
  );
}
export default App;
