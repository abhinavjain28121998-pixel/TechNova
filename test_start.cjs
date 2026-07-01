const cp = require('child_process');
const child = cp.spawn('node', ['dist/server.cjs'], {
  env: { ...process.env, DEFAULT_APP_PORT: '', PORT: '8085', NODE_ENV: 'production' },
  stdio: 'inherit'
});
setTimeout(() => {
  cp.execSync('curl -v http://localhost:8085/api/health', { stdio: 'inherit' });
  child.kill();
}, 2000);
