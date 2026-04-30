import fs from 'fs';
import { generateBlogPostGraphSchema } from './src/lib/seo.ts';
console.log(generateBlogPostGraphSchema({slug: "expert-guide-digital-transformation", title: "Test", coverImage: "/test.jpg"}));
