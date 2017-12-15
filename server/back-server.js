const express = require('express');

const app = express();
const url = `/api/third-party/youtube`;
const port = 3000;

app.get(url, (req, res) => {
  const code = res.query.code;
  const error = res.query.error;
  if (error) {
    console.log(`Error:`, error);
  } else {
    console.log(`Code:`, code);
  }
});

app.listen(port);
