import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY
    });

    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const lastUserMessage = history.pop();
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
       return res.status(400).json({ error: 'Last message must be from the user' });
    }

    const chat = ai.chats.create({
       model: 'gemini-2.5-flash',
       config: {
          systemInstruction: 'You are a helpful UI assistant on the TechNova Blog website. Answer technical questions briefly and politely. Inform them you can answer questions about TechNova articles and software engineering.',
       },
       history: history
    });

    const response = await chat.sendMessage({ message: lastUserMessage.parts[0].text });
    
    res.status(200).json({ text: response.text });
  } catch (e) {
    console.error("Chatbot error:", e);
    res.status(500).json({ error: 'Chat API failed' });
  }
}
