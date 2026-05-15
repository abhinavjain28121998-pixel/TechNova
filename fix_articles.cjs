const fs = require('fs');

const files = [
  { 
    path: 'src/data/itHelpdeskPost.ts', 
    industry: 'the IT support industry', 
    title: 'Revolutionizing IT Support with AI Helpdesk Automation',
    desc: 'Learn how AI for IT helpdesk automation transforms tier-1 support, rapidly diagnosing technical issues and accelerating critical response times securely.',
    author: 'James Carter'
  },
  { 
    path: 'src/data/itChatbotPost.ts', 
    industry: 'the IT chatbot industry',
    title: 'Enterprise Efficiency: Deploying AI-Powered Chatbots in IT',
    desc: 'Discover how AI-powered chatbots transform enterprise IT support corridors. Learn about natural language problem resolution and dynamic troubleshooting logic.',
    author: 'Elena Rostova'
  },
  { 
    path: 'src/data/itTicketPost.ts', 
    industry: 'ticket classification',
    title: 'Streamlining Operations Using AI Automated Ticket Classification',
    desc: 'Learn how automated ticket classification utilizes advanced machine learning models to eliminate manual IT triage, directly reducing overall operational delay.',
    author: 'David Chen'
  },
  { 
    path: 'src/data/itIncidentPost.ts', 
    industry: 'incident management automation',
    title: 'Accelerating Resolution with AI Incident Management Automation',
    desc: 'Learn how AI transforms enterprise incident management. Discover how machine learning natively accelerates root cause analysis and mitigates severe outages.',
    author: 'Sarah Rahman',
    isIncident: true
  }
];

function buildFAQSchemaHtml(content, title, desc, author) {
  let schemaHTML = `\n<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "description": "${desc}",
  "author": {
    "@type": "Person",
    "name": "${author}"
  }
}
</script>`;

  const matches = [...content.matchAll(/question:\s*"([^"]+)",\s*answer:\s*"([^"]+)"/g)];
  if (matches.length > 0) {
    const faqEntities = matches.map(m => {
      return `    {
      "@type": "Question",
      "name": "${m[1]}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${m[2]}"
      }
    }`;
    });

    schemaHTML += `\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n${faqEntities.join(',\n')}\n  ]\n}\n</script>\n`;
  }
  return schemaHTML;
}

for (const file of files) {
  let content = fs.readFileSync(file.path, 'utf8');

  // Fix Gibberish in Incident Post
  if (file.isIncident) {
      content = content.replace(
        /Automated incident management functionally radically safely structurally elegantly effectively successfully explicitly cleanly successfully comfortably correctly realistically carefully smartly beautifully dynamically thoughtfully completely elegantly represents the ultimate operational safeguard safely magically organically optimally cleverly brilliantly organically cleverly securely elegantly smartly creatively neatly naturally explicitly perfectly gracefully beautifully properly successfully functionally explicitly playfully flexibly properly smoothly\./,
        "Automated incident management represents the ultimate operational safeguard. By intelligently executing rapid root cause analysis and proactive mitigation, AI guarantees high availability while allowing engineering teams to focus on continuous infrastructure improvement."
      );
  }

  // Standardize headers to exactly match request
  content = content.replace(/## What AI Means in[\w\s]+/g, '## What AI means in ' + file.industry);
  content = content.replace(/## Key Use Cases[\w\s]+/gi, '## Key use cases');
  content = content.replace(/## Benefits for[\w\s]+/gi, '## Benefits for businesses');
  content = content.replace(/## Challenges and Risks in[\w\s]+/gi, '## Challenges and risks');

  // Add JSON-LD Schema
  if (!content.includes('application/ld+json')) {
    const schemaHTML = buildFAQSchemaHtml(content, file.title, file.desc, file.author);
    content = content.replace(/(`\s*})$/m, schemaHTML + "$1");
  }

  fs.writeFileSync(file.path, content);
}
console.log('Fixed and standardized headers.');
