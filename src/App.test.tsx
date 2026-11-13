import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock('./components/LivePreview', () => ({ LivePreview: () => <div>preview</div> }));
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => url === '/api/config'
    ? { json: async () => ({ envKeys: { google: false, anthropic: false } }) }
    : { ok: true, json: async () => ({ code: 'render(<div>Hello</div>)' }) }));
});
afterEach(() => vi.unstubAllGlobals());

function submit(prompt: string) {
  fireEvent.change(screen.getByLabelText('만들고 싶은 컴포넌트'), { target: { value: prompt } });
  fireEvent.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
}

it('선택한 Provider를 다시 마운트해도 복원한다', () => {
  const view = render(<App />);
  fireEvent.change(screen.getByLabelText('AI 제공자'), { target: { value: 'anthropic' } });
  view.unmount(); render(<App />);
  expect(screen.getByLabelText('AI 제공자')).toHaveValue('anthropic');
});

it('Provider별 API 키를 복원하고 노출 상태는 저장하지 않는다', () => {
  const view = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'google-test-key' } });
  fireEvent.click(screen.getByRole('button', { name: 'API 키 보기' }));
  fireEvent.change(screen.getByLabelText('AI 제공자'), { target: { value: 'anthropic' } });
  expect(screen.getByLabelText('API 키')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'anthropic-test-key' } });
  view.unmount(); render(<App />);
  expect(screen.getByLabelText('API 키')).toHaveValue('anthropic-test-key');
  expect(screen.getByLabelText('API 키')).toHaveAttribute('type', 'password');
  fireEvent.change(screen.getByLabelText('AI 제공자'), { target: { value: 'google' } });
  expect(screen.getByLabelText('API 키')).toHaveValue('google-test-key');
});

it('제출한 프롬프트 히스토리를 복원하고 다시 입력할 수 있다', async () => {
  const view = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'test-key' } });
  submit('프로필 카드');
  await waitFor(() => expect(screen.getByLabelText('프롬프트 히스토리')).toBeInTheDocument());
  view.unmount(); render(<App />);
  fireEvent.change(screen.getByLabelText('프롬프트 히스토리'), { target: { value: '프로필 카드' } });
  expect(screen.getByLabelText('만들고 싶은 컴포넌트')).toHaveValue('프로필 카드');
});

it('생성 목록과 날짜를 복원하고 개별 삭제도 유지한다', async () => {
  const view = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'test-key' } });
  submit('프로필 카드');
  await screen.findByRole('button', { name: '재생성' });
  view.unmount();
  const restored = render(<App />);
  expect(screen.getByText('프로필 카드', { selector: 'p' })).toBeInTheDocument();
  expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '삭제' }));
  restored.unmount(); render(<App />);
  expect(screen.queryByRole('button', { name: '재생성' })).not.toBeInTheDocument();
});

it('전체 삭제 후에도 생성 목록이 비어 있다', async () => {
  const view = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'test-key' } });
  submit('카드'); await screen.findByRole('button', { name: '재생성' });
  fireEvent.click(screen.getByRole('button', { name: '전체 삭제' }));
  view.unmount(); render(<App />);
  expect(screen.queryByRole('button', { name: '재생성' })).not.toBeInTheDocument();
});

it('손상된 저장 데이터는 기본값으로 복원한다', () => {
  localStorage.setItem('component-club:api-keys', '{broken');
  localStorage.setItem('component-club:provider', '"unknown"');
  localStorage.setItem('component-club:history', '{}');
  localStorage.setItem('component-club:components', '[{"id":"bad","createdAt":"invalid"}]');
  render(<App />);
  expect(screen.getByLabelText('AI 제공자')).toHaveValue('google');
  expect(screen.getByLabelText('API 키')).toHaveValue('');
  expect(screen.queryByLabelText('프롬프트 히스토리')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '재생성' })).not.toBeInTheDocument();
});

it('저장소 접근이 차단되어도 입력과 생성은 계속 동작한다', async () => {
  vi.stubGlobal('localStorage', {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('quota'); },
  });
  render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'test-key' } });
  submit('카드');
  await screen.findByRole('button', { name: '재생성' });
});
