const content = `### Conclusion
Agentic AI automation is not just an incremental improvement; it is a fundamental restructuring of how enterprise software operates. By orchestrating multi-agent workflows, businesses can scale their operations autonomously, securely, and efficiently.
\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://tech-nova-iota.vercel.app/blog/agentic-ai-automation-multi-agent-workflows"
  },
  "headline": "Agentic AI Automation: Orchestrating Multi-Agent Enterprise Workflows",
  "description": "Learn how agentic AI automation and multi-agent workflows are transforming enterprise operations.",
  "author": {
    "@type": "Person",
    "name": "Abhinav Jain"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TechNova",
    "logo": {
      "@type": "ImageObject",
      "url": "https://tech-nova-iota.vercel.app/logo.png"
    }
  },
  "datePublished": new Date().toISOString()
}
\`\`\``;

console.log(content.replace(/```json\s*\{[\s\S]*?"@context"\s*:\s*"https?:\/\/schema\.org"[\s\S]*?\}\s*```/g, 'REPLACED'));
