import https from 'https';

const url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=Artificial_intelligence|Machine_learning|Cloud_computing';

https.get(url, { headers: { 'User-Agent': 'MyApp/1.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
