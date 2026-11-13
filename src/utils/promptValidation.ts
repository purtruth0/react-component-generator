export const MAX_PROMPT_LENGTH = 500;

/** 공백·줄바꿈을 포함한 JavaScript 문자열 길이(UTF-16 코드 단위)를 검사한다. */
export function isPromptLengthValid(prompt: string): boolean {
  return prompt.length <= MAX_PROMPT_LENGTH;
}
