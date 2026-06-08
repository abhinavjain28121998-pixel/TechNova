import https from 'https';
const url = 'https://unsplash.com/napi/search/photos?query=artificial+intelligence&per_page=5';
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 800)));
});
