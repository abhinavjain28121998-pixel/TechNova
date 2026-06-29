const cp = require('child_process');
const child = cp.spawn('node', ['dist/server.cjs'], {
  env: { ...process.env, DEFAULT_APP_PORT: '', PORT: '8082', NODE_ENV: 'production' },
  stdio: 'inherit'
});
setTimeout(() => {
  cp.execSync('curl -v http://localhost:8082/api/health', { stdio: 'inherit' });
  child.kill();
}, 2000);
