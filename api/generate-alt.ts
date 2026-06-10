import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { src, context } = req.body;
    if (!src) {
      return res.status(400).json({ error: 'src parameter is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
    });

    const imageResp = await fetch(src);
    if (!imageResp.ok) {
      throw new Error(`HTTP error! status: ${imageResp.status}`);
    }
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const prompt = `Provide a concise, descriptive alt text for this image to be used by screen readers in a blog post.
    Article context: ${context?.substring(0, 300) || 'General technology article'}.
    Respond ONLY with the alt text, no quotes or explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64,
              mimeType: mimeType
            }
          }
        ]
      }
    });

    res.status(200).json({ text: response.text?.trim() || '' });
  } catch (e) {
    console.error("Alt text generation error:", e);
    res.status(500).json({ error: 'Failed to generate alt text' });
  }
}
