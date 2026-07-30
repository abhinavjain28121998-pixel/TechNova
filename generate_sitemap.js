import { execSync } from 'child_process';

console.log('Generating sitemap.xml...');
try {
  execSync('npx tsx scripts/generate_sitemap.js', { stdio: 'inherit' });
  console.log('Successfully generated sitemap.xml in the public directory.');
} catch (error) {
  console.error('Failed to generate sitemap.xml:', error.message);
  process.exit(1);
}
