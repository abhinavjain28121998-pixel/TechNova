import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const topics = [
  {
    topic: "Model Context Protocol (MCP): The New Standard for AI Agent Integration",
    keyword: "Model Context Protocol",
    slug: "model-context-protocol-mcp-ai-agents",
  },
  {
    topic: "AI Observability and Telemetry: Securing Enterprise LLM Deployments",
    keyword: "AI Observability",
    slug: "ai-observability-enterprise-llm-deployments",
  },
  {
    topic: "Reasoning AI Models: Moving Beyond Pattern Matching (System 2 AI)",
    keyword: "Reasoning AI Models",
    slug: "reasoning-ai-models-system-2",
  },
  {
    topic: "Browser-Native AI and Web Agents: Redefining Digital Interaction",
    keyword: "Browser-Native AI",
    slug: "browser-native-ai-web-agents",
  }
];

async function generateArticle(topicObj) {
  const prompt = `You are a world-class AI technology journalist and SEO expert. 
Write a highly detailed, comprehensive SEO-optimized article (around 2500 words) about: "${topicObj.topic}".
Target Keyword: "${topicObj.keyword}".
URL Slug: "${topicObj.slug}".

Include:
- What is it, Why it matters, Architecture, Enterprise Applications, Industry Use Cases, Implementation, Best Practices, Challenges, Future Trends.
- 8-12 FAQs.
- Include a valid JSON-LD schema inside a code block in the content.
- Incorporate EEAT, technical depth, and internal linking placeholders (e.g., [Link to Enterprise Gen AI]).

Provide the result as a valid JSON object matching this schema exactly:
{
  "title": "SEO title string",
  "metaDescription": "Meta description string",
  "excerpt": "Short excerpt string",
  "content": "Full markdown content string (include the JSON-LD schema within it as a code block)",
  "faqs": [{"question": "...", "answer": "..."}]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
        responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text);
}

async function run() {
  const results = [];
  for (const t of topics) {
    console.log("Generating for:", t.topic);
    try {
        const article = await generateArticle(t);
        results.push({
            id: t.slug,
            slug: t.slug,
            title: article.title,
            excerpt: article.excerpt,
            metaDescription: article.metaDescription,
            content: article.content,
            faqs: article.faqs,
            date: "2026-07-16",
            category: "Artificial Intelligence",
            author: {
                name: "Abhinav Jain",
                role: "AI Strategist",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abhinav"
            }
        });
    } catch(e) {
        console.error("Failed", t.topic, e.message);
    }
  }

  const tsContent = `import { Post } from '../types';

export const newTrendingArticles: Post[] = ${JSON.stringify(results, null, 2)};
`;

  fs.writeFileSync('src/data/newTrendingArticles.ts', tsContent);
  console.log("Done");
}

run();
