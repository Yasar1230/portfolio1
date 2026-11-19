import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_SIZES = new Set(['1K', '2K', '4K']);
const ALLOWED_ASPECT_RATIOS = new Set([
  '1:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '21:9',
]);
const ALLOWED_IMAGE_MODELS = new Set([
  'gemini-3-pro-image-preview',
  'gemini-nano-banana-2.1',
]);

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add an API key in Settings > Secrets to use the Engineering Studio Lab.',
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  if (/API_KEY_INVALID|PERMISSION_DENIED|403/i.test(raw)) {
    return {
      status: 403,
      message:
        'API key access was denied for this model. Verify your key in Settings > Secrets.',
    };
  }
  if (/RESOURCE_EXHAUSTED|429/i.test(raw)) {
    return {
      status: 429,
      message:
        'Quota exceeded or paid billing is required for this model. You can switch to Fast Q&A or attach a billing-enabled key in Settings > Secrets.',
    };
  }
  if (/NOT_FOUND|404/i.test(raw)) {
    return {
      status: 404,
      message: `Requested model was not found or unavailable on this key: ${raw}`,
    };
  }
  return {
    status: 500,
    message: raw || 'Unexpected error communicating with Gemini API.',
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '4mb' }));

  // Low-latency mechanical engineering Q&A using gemini-3.1-flash-lite
  app.post('/api/gemini/fast', async (req: Request, res: Response) => {
    try {
      const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
      if (!prompt || prompt.length < 4) {
        res.status(400).json({ error: 'Please provide a question of at least 4 characters.' });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a concise mechanical engineering reference assistant for a student portfolio covering robotics, electric vehicles, thermal management, and controls. Answer clearly with crisp physical intuition and keep responses under 220 words.',
        },
      });

      res.json({
        model: 'gemini-3.1-flash-lite',
        text: response.text ?? '',
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // High-thinking deep engineering analysis using gemini-4-carbon (ThinkingLevel.HIGH, no maxOutputTokens)
  app.post('/api/gemini/think', async (req: Request, res: Response) => {
    try {
      const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
      if (!prompt || prompt.length < 4) {
        res.status(400).json({ error: 'Please provide an engineering problem of at least 4 characters.' });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-carbon',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a rigorous mechanical and mechatronics engineering analyst. Break down first-principles mechanics, thermodynamics, control stability, or EV safety trade-offs cleanly with equations and practical prototyping steps.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      res.json({
        model: 'gemini-4-carbon',
        thinkingLevel: 'HIGH',
        text: response.text ?? '',
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Studio concept visualization using gemini-3-pro-image-preview or gemini-nano-banana-2.1
  app.post('/api/gemini/image', async (req: Request, res: Response) => {
    try {
      const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
      const imageSize = typeof req.body?.imageSize === 'string' ? req.body.imageSize : '1K';
      const aspectRatio =
        typeof req.body?.aspectRatio === 'string' ? req.body.aspectRatio : '16:9';
      const model =
        typeof req.body?.model === 'string' ? req.body.model : 'gemini-3-pro-image-preview';

      if (!prompt || prompt.length < 4) {
        res.status(400).json({ error: 'Please provide a visual concept prompt of at least 4 characters.' });
        return;
      }
      if (!ALLOWED_SIZES.has(imageSize)) {
        res.status(400).json({ error: 'Invalid imageSize. Allowed: 1K, 2K, 4K.' });
        return;
      }
      if (!ALLOWED_ASPECT_RATIOS.has(aspectRatio)) {
        res.status(400).json({
          error: 'Invalid aspectRatio. Allowed: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9.',
        });
        return;
      }
      if (!ALLOWED_IMAGE_MODELS.has(model)) {
        res.status(400).json({
          error: 'Invalid model. Allowed: gemini-3-pro-image-preview, gemini-nano-banana-2.1.',
        });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              text: `Industrial engineering concept study: ${prompt}. Clean neutral studio background, precision machined details, technical editorial lighting.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      });

      let imageDataUrl: string | null = null;
      let caption = '';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }

      if (!imageDataUrl) {
        res.status(502).json({
          error: 'The model returned no image data for this prompt. Try refining the engineering description.',
        });
        return;
      }

      res.json({
        model,
        imageSize,
        aspectRatio,
        imageDataUrl,
        caption: caption.trim(),
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (!isProd || !fs.existsSync(distDir)) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Engineering Portfolio server running at http://localhost:${PORT}`);
  });
}

startServer();
