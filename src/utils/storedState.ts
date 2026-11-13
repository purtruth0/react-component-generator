import type { GeneratedComponent, Provider } from '../types';

export const decodeProvider = (value: unknown): Provider => value === 'anthropic' ? value : 'google';
export const decodeKeys = (value: unknown): Record<Provider, string> => {
  const keys = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    google: typeof keys.google === 'string' ? keys.google : '',
    anthropic: typeof keys.anthropic === 'string' ? keys.anthropic : '',
  };
};
export const decodeHistory = (value: unknown): string[] => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string') : [];
export function decodeComponents(value: unknown): GeneratedComponent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.prompt !== 'string'
      || typeof record.code !== 'string' || typeof record.createdAt !== 'string') return [];
    const createdAt = new Date(record.createdAt);
    return Number.isNaN(createdAt.getTime()) ? [] : [{
      id: record.id, prompt: record.prompt, code: record.code, createdAt,
    }];
  });
}
