import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const basePrompt = `Write a high-quality SEO article based on the following topic. 
Topic: {TOPIC}

Requirements:
1. E-E-A-T Framework: demonstrate real-world experience, expert knowledge, authoritative insights, and trustworthy information. 
2. Length: 1000-1500 words. Focus on depth, actionable insights, and comprehensiveness.
3. Content Structure:
- Start with a compelling introduction (no heading).
- Include an H1 title (8–12 words, SEO-friendly) as the very first line starting with #.
- Organize content using clear H2 and H3 headings. Short paragraphs, simple language.
- Structure should include: Introduction, What AI means in that industry, Key use cases, Benefits for businesses, Challenges and risks, How to implement AI effectively, Why expert AI implementation matters, Conclusion.
4. Exact Keywords to include naturally exactly once per article with Markdown links:
- [Gen AI in HR](https://www.thehackettgroup.com/gen-ai-in-hr/)
- [Generative AI consulting company](https://www.thehackettgroup.com/gen-ai-consulting/)
5. Meta description: Include a meta description (150-160 chars) at the very top before the H1 in this format: "META: <meta description here>"
6. FAQs: Include a section at the end with 4-6 highly relevant FAQs.
7. Schema Markup: At the very end of the content, generate the FAQ Schema (JSON-LD) and Article Schema (JSON-LD). Wrap each in standard HTML <script type="application/ld+json"> ... </script> tags wrapped inside a markdown code block (\`\`\`html) or raw. Our platform supports stripping them if inside markdown codeblocks or raw. Better to just output raw <script type="application/ld+json">...</script> tags without markdown code block wrappers to guarantee parsing.
8. Make it distinct and do not repeat generic wording across articles. Use specific examples. DO NOT use generic AI filler words.`;

const topics = [
  { id: 'gen-ai-interview-questions', title: 'Generative AI for Interview question generation', slug: 'generative-ai-interview-question-generation' },
  { id: 'gen-ai-interview-assistants', title: 'Generative AI for interview assistants', slug: 'generative-ai-interview-assistants' },
  { id: 'gen-ai-candidate-matching', title: 'Gen AI for Candidate assessment and matching', slug: 'gen-ai-candidate-assessment-matching' },
  { id: 'gen-ai-recruitment-chatbot', title: 'Generative AI for Recruitment chatbot support', slug: 'generative-ai-recruitment-chatbot-support' }
];

async function generate() {
  const articles = [];
  
  for (const topic of topics) {
    console.log("Generating for:", topic.title);
    
    // We try until success
    let success = false;
    let retries = 0;
    while (!success && retries < 3) {
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: basePrompt.replace('{TOPIC}', topic.title)
          });
          
          let text = res.text;
          
          let meta = '';
          const metaMatch = text.match(/META:\s*(.*?)(?=\n|$)/i);
          if (metaMatch) {
             meta = metaMatch[1];
             text = text.replace(/META:\s*(.*?)(?=\n|$)/i, '').trim();
          }
          
          let h1 = topic.title;
          const h1Match = text.match(/^#\s+(.*)/m);
          if (h1Match) {
              h1 = h1Match[1].replace(/\*\*/g, '');
              text = text.replace(/^#\s+(.*)/m, '').trim();
          }

          articles.push({
            topic,
            meta,
            h1,
            content: text
          });
          success = true;
          console.log("Success:", topic.title);
        } catch (e) {
            console.error("Failed, retrying:", e.message);
            retries++;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
  }

  // Format as TS array
  let tsContent = `import { Post } from '../types';\n\nexport const newHrArticles: Post[] = [\n`;
  
  for (const a of articles) {
     const cleanContent = a.content.replace(/`/g, '\\`').replace(/\\$/g, '\\$');
     tsContent += ` {
  id: '${a.topic.id}',
  slug: '${a.topic.slug}',
  title: \`${a.h1}\`,
  excerpt: \`${a.meta || a.h1}\`,
  metaDescription: \`${a.meta || a.h1}\`,
  category: 'HR',
  tags: ['HR', 'Generative AI', 'Recruitment', 'Talent Acquisition'],
  date: new Date().toISOString(),
  coverImage: '/banners/the-leader-s-guide-to-human-resources-applied-intelligence-in-2026.png',
  readingTime: '7 min read',
  author: {
    name: 'Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?u=sarah_hr',
    role: 'HR Technology Analyst'
  },
  content: \`\n${cleanContent}\n\`
 },\n`;
  }
  
  tsContent += `];\n`;
  
  fs.writeFileSync('src/data/newHrArticles.ts', tsContent);
  console.log("Wrote src/data/newHrArticles.ts");
}

generate();
