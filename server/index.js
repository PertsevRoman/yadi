const fs = require('fs');
const express = require('express');

const yadisk = require('./yadisk');
const youtube = require('./youtube');

const app = express();
const port = 3000;
const oauthToken = fs.readFileSync('server/yandex.key', 'utf8').toString().replace('\n', '').replace('\r', '');

app.get('/', (req, res) => res.send({
  target: 1
}));

app.get('/youtube-url', (req, res) => {
  res.send({
    url: youtube.generateUrl()
  });
});

app.get('/videos', (req, res) => {
  youtube.getVideos().then(channels => {
    res.send(channels);
  }).catch(err => {
    console.log(`Error`, err);
    res.send([]);
  });
});

app.get('/disk-tree', (req, res) => {
  let response = [];

  const getDirectoryTree = (token, path, node) => {
    return new Promise((accept, reject) => {
      yadisk.getResources(token, path).then(d => {
        let promises = [];
        if (d._embedded && d._embedded.items) {
          d._embedded.items.forEach(item => {
            if (item.type === 'file') {
              let fileItem = {
                text: item.name,
                path
              };

              if (item.preview) fileItem.preview = item.preview;

              node.push(fileItem);
            } else if (item.type === 'dir') {
              let subtree = {
                text: item.name,
                path,
                nodes: []
              };

              let subPath = path.slice(-1) === `/` ? `${path}${subtree.text}` : `${path}/${subtree.text}`;
              promises.push(getDirectoryTree(token, subPath, subtree.nodes));

              node.push(subtree);
            }
          });
        } else {
          accept();
        }

        Promise.all(promises).then(() => {
          accept();
        }).catch(() => {
          reject();
        });
      }).catch(e => {
        reject();
        console.error(e);
      });
    });
  };

  getDirectoryTree(oauthToken, '/', response).then(() => {
    res.send(response);
  }).catch(() => {
    console.log(`error`);
    res.send([]);
  });
});

app.listen(port);
