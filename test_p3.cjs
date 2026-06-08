const axios = require('axios');
axios.get('https://image.pollinations.ai/prompt/Professional?width=120&height=120')
  .then(r => console.log(r.status))
  .catch(e => console.error(e.response ? e.response.status : e.message));
