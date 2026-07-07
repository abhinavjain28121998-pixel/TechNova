const cp = require('child_process');
const child = cp.spawn('node', ['dist/server.cjs'], {
  env: { ...process.env, DEFAULT_APP_PORT: '', PORT: '8085', NODE_ENV: 'production' },
  stdio: 'inherit'
});
setTimeout(() => {
  try {
    console.log("=== Testing /api/health ===");
    cp.execSync('curl -v http://localhost:8085/api/health', { stdio: 'inherit' });
    console.log("=== Testing / (Home Page) ===");
    cp.execSync('curl -v http://localhost:8085/', { stdio: 'inherit' });
    console.log("=== Testing /blog (Blog Page) ===");
    cp.execSync('curl -v http://localhost:8085/blog', { stdio: 'inherit' });
    console.log("=== Testing /blog/ (Blog Page with trailing slash) ===");
    cp.execSync('curl -v http://localhost:8085/blog/', { stdio: 'inherit' });
  } catch (e) {
    console.error("Curl test failed:", e.message);
  }
  child.kill();
}, 3000);
