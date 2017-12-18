const fs = require('fs');
const express = require('express');

const yadisk = require('./yadisk');
const youtube = require('./youtube');

const app = express();
const port = 3000;
const oauthToken = fs.readFileSync('server/yandex.key', 'utf8').toString().replace('\n', '').replace('\r', '');

app.use(express.json());

app.get('/', (req, res) => res.send({
  target: 1
}));

app.get('/youtube-url', (req, res) => {
  res.send({
    url: youtube.generateUrl()
  });
});

app.post('/get-file', (req, res) => {
  const fileName = req.body.fileName;
  const fileDir = req.body.fileDir;

  let resource = fileDir.charAt(-1) === `/` || fileDir === `/` ? `${fileDir}${fileName}` : `${fileDir}/${fileName}`;
  yadisk.downloadUrl(oauthToken, resource).then(url => {
    yadisk.downloadFile(oauthToken, url.href, fileName).then(() => {
      res.send({
        status: 'ok'
      });
    }).catch(err => {
      console.log(err);
      res.send(err);
    });
  }).catch(err => {
    console.log(err);
    res.send(err);
  });
});

app.post('/upload-video', (req, res) => {
  youtube.uploadVideo('D:/temp', 'tund.mp4').then(uploaded => {
    console.log(uploaded);
    res.send(uploaded);
  }).catch(err => {
    console.log(`error`, err);
    res.send(err);
  });
});

app.get('/videos', (req, res) => {
  youtube.getVideos().then(channels => {
    res.send(channels);
  }).catch(err => {
    console.log(err);
    res.send(err);
  });
});

app.get('/disk-tree', (req, res) => {
  let response = [];

  yadisk.getDirectoryTree(oauthToken, '/', response).then(() => {
    res.send(response);
  }).catch(() => {
    console.log(`error`);
    res.send([]);
  });
});

app.listen(port);
