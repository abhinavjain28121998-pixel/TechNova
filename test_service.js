import { getPosts, getPostsPaginated } from "./src/lib/postService";

async function test() {
  const result = await getPostsPaginated(1, 5);
  console.log("paginated posts count:", result.posts.length);
  result.posts.forEach(p => console.log(p.id, p.date));
}

test();
