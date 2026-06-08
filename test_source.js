import https from 'https';
https.get('https://source.unsplash.com/1200x600/?artificial', res => {
  console.log(res.statusCode, res.headers.location);
});
