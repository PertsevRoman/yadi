const express = require('express');
const google = require('googleapis');
const fs = require('fs');
const googleAuth = require('google-auth-library');

const app = express();
const url = `/third-party/youtube`;
const port = 3000;
const config = JSON.parse(fs.readFileSync('./server/youtube.json').toString());

const REDIRECT_URL = `https://new.sdoetru.ru/api/third-party/youtube`;
const auth = new googleAuth();
const oauth2 = new auth.OAuth2(config.client.client_id, config.client.client_secret, REDIRECT_URL);

app.get(url, (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error) {
    console.log(`Error:`, error);
    return;
  }

  oauth2.getToken(code, (err, token) => {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }

    console.log(`token`, token);
    oauth2.credentials = token;
  });

  res.send({});
});

app.listen(port);
