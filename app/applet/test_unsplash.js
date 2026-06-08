import https from 'https';

https.get('https://unsplash.com/napi/search/photos?query=artificial+intelligence&per_page=5', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 500)));
});
