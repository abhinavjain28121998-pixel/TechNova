import { financeUseCasesPosts } from './src/data/financeUseCasesPosts';
import GithubSlugger from 'github-slugger';
const slugger = new GithubSlugger();
const regex = /^(#{1,6})\s+(.+)$/gm;

const content = financeUseCasesPosts[0].content;
let match;
while ((match = regex.exec(content)) !== null) {
  const text = match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_\~`]/g, '').trim();
  console.log('Found:', text);
  console.log('ID:', slugger.slug(text));
}
