import https from 'https';

https.get('https://image.pollinations.ai/prompt/AI%20Data?width=120&height=60&nologo=true', (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Redirect location:', res.headers.location);
});
