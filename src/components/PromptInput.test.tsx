import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });
});

describe('PromptInput 길이 검증', () => {
  it('정확히 500자인 프롬프트는 생성할 수 있다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    await user.click(screen.getByRole('textbox'));
    await user.paste('가'.repeat(500));
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    expect(onGenerate).toHaveBeenCalledWith('가'.repeat(500));
  });

  it('501자를 붙여넣으면 생성 버튼이 비활성이다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    await user.click(screen.getByRole('textbox'));
    await user.paste('가'.repeat(501));
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(onGenerate).not.toHaveBeenCalled();
  });
});

describe('PromptInput 초과 입력 제출 방어', () => {
  it.each(['Control', 'Meta'])('%s+Enter로도 501자 프롬프트를 제출할 수 없다', async (modifier) => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    await user.click(screen.getByRole('textbox'));
    await user.paste('가'.repeat(501));
    await user.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);
    expect(onGenerate).not.toHaveBeenCalled();
  });
});

describe('PromptInput 길이 안내', () => {
  it('현재 글자 수와 최대 길이를 표시한다', async () => {
    const user = userEvent.setup();
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByText('0 / 500자')).toBeVisible();
    await user.type(screen.getByRole('textbox'), '카드');
    expect(screen.getByText('2 / 500자')).toBeVisible();
  });

  it('초과 입력에 오류와 접근성 설명을 표시하고 수정하면 해제한다', async () => {
    const user = userEvent.setup();
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.paste('가'.repeat(501));
    expect(input).toHaveValue('가'.repeat(501));
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/프롬프트는 500자 이내로 입력해 주세요/);
    expect(screen.getByRole('alert')).toHaveTextContent('프롬프트는 500자 이내로 입력해 주세요.');
    await user.keyboard('{Backspace}');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeEnabled();
  });
});
