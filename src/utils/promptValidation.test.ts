import { describe, expect, it } from 'vitest';
import { isPromptLengthValid } from './promptValidation';

describe('isPromptLengthValid', () => {
  it.each([0, 1, 499, 500])('%i자 프롬프트는 길이 제한 안에 있다', (length) => {
    expect(isPromptLengthValid('가'.repeat(length))).toBe(true);
  });

  it.each([501, 502])('%i자 프롬프트는 유효하지 않다', (length) => {
    expect(isPromptLengthValid('가'.repeat(length))).toBe(false);
  });

  it('공백과 줄바꿈도 입력 길이에 포함한다', () => {
    expect(isPromptLengthValid(' ' + '가'.repeat(499) + '\n')).toBe(false);
  });
});
