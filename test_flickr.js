import https from 'https';
https.get('https://loremflickr.com/1200/600/technology,future', res => {
  console.log(res.statusCode, res.headers.location);
});
