import { generateBlogPostGraphSchema } from './src/lib/seo';
const post = {
  slug: "expert-guide-digital-transformation", 
  title: "Test", 
  coverImage: "/test.jpg",
  category: "Digital Business",
  author: {
    name: "Alex Smith",
    role: "Senior Consultant",
    avatar: "/alex.jpg"
  }
};
console.log(JSON.stringify(generateBlogPostGraphSchema(post), null, 2));
