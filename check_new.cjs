const https = require('https');
const urls = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200'
];

urls.forEach(url => {
  https.request(url, { method: 'HEAD', timeout: 3000 }, (res) => {
    console.log(url + ' => ' + res.statusCode);
  }).end();
});
