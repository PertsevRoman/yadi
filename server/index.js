const express = require('express');
const yadisk = require('./yadisk');
const app = express();
const port = 3000;

const oauthToken = 'AQAAAAAU3TADAAS1JoDa-lrvOk30sMNEJXsU1vo';

app.get('/', (req, res) => res.send({
  target: 1
}));

app.get('/disk-tree', (req, res) => res.send({
  data: [
    {
      text: "Parent 1",
      nodes: [
        {
          text: "Child 1",
          nodes: [
            {
              text: "Grandchild 1"
            },
            {
              text: "Grandchild 2"
            }
          ]
        },
        {
          text: "Child 2"
        }
      ]
    },
    {
      text: "Parent 2"
    },
    {
      text: "Parent 3"
    },
    {
      text: "Parent 4"
    },
    {
      text: "Parent 5"
    }
  ]
}));

app.listen(port);

yadisk.getResources(oauthToken, '/документация').then(d => {
  console.log(d._embedded.items.forEach(item => console.log(`${item.type} - ${item.name}`)));
}).catch(e => console.error(e));
