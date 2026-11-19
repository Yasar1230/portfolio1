import { useEffect, useState } from 'react';
import { Brain, Image as ImageIcon, Loader2, X, Zap } from 'lucide-react';
import {
  ALLOWED_ASPECT_RATIOS,
  ALLOWED_IMAGE_MODELS,
  ALLOWED_IMAGE_SIZES,
  validateImageConfig,
  validateLabPrompt,
} from '../lib/portfolioUtils';
import type {
  AspectRatioOption,
  ImageModelOption,
  ImageSizeOption,
} from '../lib/portfolioUtils';

interface EngineeringStudioLabProps {
  open: boolean;
  initialPrompt?: string;
  onClose: () => void;
}

type LabMode = 'fast' | 'think' | 'image';

export function EngineeringStudioLab({
  open,
  initialPrompt = '',
  onClose,
}: EngineeringStudioLabProps) {
  const [mode, setMode] = useState<LabMode>('fast');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [imageModel, setImageModel] = useState<ImageModelOption>(
    'gemini-3-pro-image-preview',
  );
  const [imageSize, setImageSize] = useState<ImageSizeOption>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<{
    url: string;
    caption: string;
    meta: string;
  } | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const promptCheck = validateLabPrompt(prompt);
    if (!promptCheck.valid) {
      setError(promptCheck.error ?? 'Invalid prompt.');
      return;
    }

    if (mode === 'image') {
      const cfgCheck = validateImageConfig(imageSize, aspectRatio, imageModel);
      if (!cfgCheck.valid) {
        setError(cfgCheck.error ?? 'Invalid image configuration.');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint =
        mode === 'fast'
          ? '/api/gemini/fast'
          : mode === 'think'
            ? '/api/gemini/think'
            : '/api/gemini/image';

      const payload =
        mode === 'image'
          ? { prompt, imageSize, aspectRatio, model: imageModel }
          : { prompt };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error || `Request failed with status ${response.status}.`);
        return;
      }

      if (mode === 'image') {
        setTextResult(null);
        setImageResult({
          url: data.imageDataUrl,
          caption: data.caption || '',
          meta: `${data.model} · ${data.imageSize} · ${data.aspectRatio}`,
        });
      } else {
        setImageResult(null);
        setTextResult(data.text || 'No response returned.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error calling studio lab.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-lab-title"
      className="fixed inset-0 z-50 flex justify-end bg-[#0F1115]/60"
    >
      <div className="relative w-full max-w-xl h-full bg-[#F3F4F6] dark:bg-[#0D0F12] text-[#0F1115] dark:text-[#F2F4F7] border-l border-[#D4D8E0] dark:border-[#252A34] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D4D8E0] dark:border-[#252A34] flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147]">
              Interactive Engineering Workbench
            </p>
            <h2
              id="studio-lab-title"
              className="font-display text-2xl font-semibold tracking-tight"
            >
              Engineering Studio Lab
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Engineering Studio Lab"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#D4D8E0] dark:border-[#252A34] hover:border-[#0F1115] dark:hover:border-[#F2F4F7] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Mode Segmented Tabs */}
        <div className="px-6 pt-5">
          <div
            role="tablist"
            aria-label="Studio lab capability mode"
            className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#E7EAEF] dark:bg-[#1B1F27]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'fast'}
              onClick={() => {
                setMode('fast');
                setError(null);
              }}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'fast'
                  ? 'bg-[#FFFFFF] dark:bg-[#0D0F12] text-[#0F1115] dark:text-[#F2F4F7]'
                  : 'text-[#4B5362] dark:text-[#A1A9B8] hover:text-[#0F1115] dark:hover:text-[#F2F4F7]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#E84C1E]" aria-hidden="true" />
              <span>Fast Q&A</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === 'think'}
              onClick={() => {
                setMode('think');
                setError(null);
              }}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'think'
                  ? 'bg-[#FFFFFF] dark:bg-[#0D0F12] text-[#0F1115] dark:text-[#F2F4F7]'
                  : 'text-[#4B5362] dark:text-[#A1A9B8] hover:text-[#0F1115] dark:hover:text-[#F2F4F7]'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-[#E84C1E]" aria-hidden="true" />
              <span>Deep Thinking</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === 'image'}
              onClick={() => {
                setMode('image');
                setError(null);
              }}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'image'
                  ? 'bg-[#FFFFFF] dark:bg-[#0D0F12] text-[#0F1115] dark:text-[#F2F4F7]'
                  : 'text-[#4B5362] dark:text-[#A1A9B8] hover:text-[#0F1115] dark:hover:text-[#F2F4F7]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#E84C1E]" aria-hidden="true" />
              <span>Concept Render</span>
            </button>
          </div>
        </div>

        {/* Form & Output Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <p className="text-xs font-mono text-[#687182] dark:text-[#7E8797]">
            {mode === 'fast' &&
              'Low-latency mechanical engineering reference via gemini-3.1-flash-lite.'}
            {mode === 'think' &&
              'High-thinking first-principles engineering analysis via gemini-4-carbon (ThinkingLevel.HIGH).'}
            {mode === 'image' &&
              'Concept study rendering with selectable resolution (1K, 2K, 4K) and aspect ratios (1:1 to 21:9). Note: generated concept studies are strictly exploratory and never represent real built hardware.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'image' && (
              <div className="space-y-4 p-4 rounded-lg border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF] dark:bg-[#14171D]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="lab-image-model"
                      className="block font-mono text-xs text-[#4B5362] dark:text-[#A1A9B8]"
                    >
                      Image Model
                    </label>
                    <select
                      id="lab-image-model"
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value as ImageModelOption)}
                      className="w-full px-3 py-2 rounded-md border border-[#D4D8E0] dark:border-[#252A34] bg-[#F3F4F6] dark:bg-[#0D0F12] text-xs font-mono text-[#0F1115] dark:text-[#F2F4F7]"
                    >
                      {ALLOWED_IMAGE_MODELS.map((m) => (
                        <option key={m} value={m}>
                          {m === 'gemini-3-pro-image-preview'
                            ? 'Studio Pro (gemini-3-pro-image-preview)'
                            : 'General (gemini-nano-banana-2.1)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block font-mono text-xs text-[#4B5362] dark:text-[#A1A9B8]">
                      Image Size
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {ALLOWED_IMAGE_SIZES.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setImageSize(sz)}
                          aria-pressed={imageSize === sz}
                          className={`py-2 rounded text-xs font-mono font-medium border transition-colors ${
                            imageSize === sz
                              ? 'bg-[#E84C1E] text-white border-[#E84C1E]'
                              : 'bg-[#F3F4F6] dark:bg-[#0D0F12] text-[#0F1115] dark:text-[#F2F4F7] border-[#D4D8E0] dark:border-[#252A34]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block font-mono text-xs text-[#4B5362] dark:text-[#A1A9B8]">
                    Aspect Ratio
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ALLOWED_ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        aria-pressed={aspectRatio === ratio}
                        className={`py-1.5 rounded text-xs font-mono border transition-colors tabular-nums ${
                          aspectRatio === ratio
                            ? 'bg-[#0F1115] dark:bg-[#F2F4F7] text-[#F2F4F7] dark:text-[#0F1115] border-transparent'
                            : 'bg-[#F3F4F6] dark:bg-[#0D0F12] text-[#4B5362] dark:text-[#A1A9B8] border-[#D4D8E0] dark:border-[#252A34]'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="studio-lab-prompt"
                className="block font-mono text-xs text-[#4B5362] dark:text-[#A1A9B8]"
              >
                {mode === 'image' ? 'Concept study description' : 'Engineering prompt'}
              </label>
              <textarea
                id="studio-lab-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'image'
                    ? 'e.g., Cutaway industrial design sketch of a spherical pendulum robot with brushed aluminum ring'
                    : 'e.g., Compare phase change material heat absorption vs liquid cooling in compact EV packs'
                }
                className="w-full px-3.5 py-3 rounded-md border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF] dark:bg-[#14171D] text-sm text-[#0F1115] dark:text-[#F2F4F7] placeholder:text-[#687182]"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-md border border-[#E84C1E]/40 bg-[#E84C1E]/10 text-xs text-[#C23B12] dark:text-[#FF8A68]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] rounded-md bg-[#E84C1E] hover:bg-[#C93E15] disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>
                {loading
                  ? 'Running request...'
                  : mode === 'fast'
                    ? 'Run Fast Q&A'
                    : mode === 'think'
                      ? 'Run Deep Analysis'
                      : 'Generate Concept Study'}
              </span>
            </button>
          </form>

          {/* Output Area */}
          {textResult && (
            <div className="p-5 rounded-lg border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF] dark:bg-[#14171D] space-y-2">
              <p className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147]">
                Response
              </p>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#0F1115] dark:text-[#F2F4F7]">
                {textResult}
              </div>
            </div>
          )}

          {imageResult && (
            <div className="rounded-lg border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF] dark:bg-[#14171D] overflow-hidden">
              <img
                src={imageResult.url}
                alt="Generated engineering concept study"
                referrerPolicy="no-referrer"
                className="w-full h-auto block"
              />
              <div className="p-4 border-t border-[#D4D8E0] dark:border-[#252A34] flex items-center justify-between gap-3 text-xs font-mono text-[#4B5362] dark:text-[#A1A9B8]">
                <span className="truncate">{imageResult.meta}</span>
                <a
                  href={imageResult.url}
                  download="concept-study.png"
                  className="text-[#C23B12] dark:text-[#FF7147] hover:underline whitespace-nowrap shrink-0"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
