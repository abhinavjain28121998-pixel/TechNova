import https from 'https';
https.get('https://lexica.art/api/v1/search?q=artificial+intelligence', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 800)));
});
