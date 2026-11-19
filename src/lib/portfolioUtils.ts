import type { ContactLinkItem } from '../data/portfolioConfig';

export const ALLOWED_IMAGE_SIZES = ['1K', '2K', '4K'] as const;
export type ImageSizeOption = (typeof ALLOWED_IMAGE_SIZES)[number];

export const ALLOWED_ASPECT_RATIOS = [
  '1:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '21:9',
] as const;
export type AspectRatioOption = (typeof ALLOWED_ASPECT_RATIOS)[number];

export const ALLOWED_IMAGE_MODELS = [
  'gemini-3-pro-image-preview',
  'gemini-nano-banana-2.1',
] as const;
export type ImageModelOption = (typeof ALLOWED_IMAGE_MODELS)[number];

/**
 * Returns true if a config value is still an unconfigured [ADD ...] placeholder.
 */
export function isPlaceholderValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === 0 || /^\[ADD\b/i.test(trimmed);
}

/**
 * Resolves a safe href for contact entries, returning null when the entry
 * is still an [ADD ...] placeholder so we never render broken destination links.
 */
export function getContactHref(item: ContactLinkItem): string | null {
  if (isPlaceholderValue(item.value)) {
    return null;
  }

  const trimmed = item.value.trim();
  if (item.kind === 'email') {
    return trimmed.startsWith('mailto:') ? trimmed : `mailto:${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export interface LabValidationResult {
  valid: boolean;
  error?: string;
}

export function validateLabPrompt(prompt: string): LabValidationResult {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { valid: false, error: 'Enter an engineering question or concept prompt first.' };
  }
  if (trimmed.length < 4) {
    return { valid: false, error: 'Prompt must be at least 4 characters long.' };
  }
  if (trimmed.length > 2000) {
    return { valid: false, error: 'Prompt must stay under 2,000 characters.' };
  }
  return { valid: true };
}

export function validateImageConfig(
  size: string,
  aspectRatio: string,
  model: string,
): LabValidationResult {
  if (!ALLOWED_IMAGE_SIZES.includes(size as ImageSizeOption)) {
    return { valid: false, error: `Unsupported image size: ${size}` };
  }
  if (!ALLOWED_ASPECT_RATIOS.includes(aspectRatio as AspectRatioOption)) {
    return { valid: false, error: `Unsupported aspect ratio: ${aspectRatio}` };
  }
  if (!ALLOWED_IMAGE_MODELS.includes(model as ImageModelOption)) {
    return { valid: false, error: `Unsupported image model: ${model}` };
  }
  return { valid: true };
}
