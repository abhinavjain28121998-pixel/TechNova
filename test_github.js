import https from 'https';
https.get('https://raw.githubusercontent.com/firasdib/unsplash-images/master/unsplash-images.json', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 500)));
});
