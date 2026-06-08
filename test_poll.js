import https from 'https';
https.get('https://image.pollinations.ai/prompt/Professional%20clean?width=120&height=60&nologo=true', (res) => {
  console.log('Status Details:', res.statusCode, res.headers['content-type']);
});
