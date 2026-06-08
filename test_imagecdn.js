import https from 'https';

https.get('https://random.imagecdn.app/v1/image?width=1200&height=600&category=technology&format=json', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
