const fs = require('fs');
let text = fs.readFileSync('src/data/posts.ts', 'utf8');

// Insert imports
const imports = `import { itHelpdeskPost } from './itHelpdeskPost';
import { itChatbotPost } from './itChatbotPost';
import { itTicketPost } from './itTicketPost';
import { itIncidentPost } from './itIncidentPost';
`;
text = text.replace(/(import { hrArticles } from '.\/hrArticles';)/, "$1\n" + imports);

// Add to array
const exportsArr = `  ...itHelpdeskPost,
  ...itChatbotPost,
  ...itTicketPost,
  ...itIncidentPost,
`;
text = text.replace(/(\.\.\.hrArticles,)/, "$1\n" + exportsArr);

fs.writeFileSync('src/data/posts.ts', text);
