/**
 * @description <h5>Yandex Disk REST Api</h5>
 *
 *
 * @module yadisk
 */
const https = require('https');
const fs = require('fs');

/**
 *
 * @param options
 */
const makeGetParameters = options => {
  let blocks = [];
  for (let paramName in options) {
    blocks.push(`${paramName}=${options[paramName]}`);
  }

  return blocks.length ? encodeURI(`?${blocks.join('&')}`) : '';
};

/**
 * Base request method
 * @param token
 * @param options
 * @param method
 * @return {Promise<any>}
 */
const makeRequest = (token, options = {}, method = 'GET') => {
  let {path = `/`, parameters, postContent} = options;
  let parametersString = makeGetParameters(parameters);

  if (path.length > 0 && path.charAt(0) !== `/`) {
    path = `/${path}`;
  }

  return new Promise((accept, reject) => {
    let oauth = `OAuth ${token}`;

    let headers = {
      'authorization': oauth
    };
    const options = {
      hostname: `cloud-api.yandex.net`,
      port: 443,
      path: `/v1/disk${path}${parametersString}`,
      method,
      headers: headers
    };

    let respData = '';
    const req = https.request(options, res => {
      res.on('data', d => {
        if (d != null) {
          respData += d.toString();
        }
      });

      res.on('end', () => {
        accept(JSON.parse(respData));
      });
    });

    req.on('error', e => {
      reject(e);
    });

    req.end();
  });
};

/**
 *
 * @param token
 * @param resource
 * @return {Promise<any>}
 */
const downloadUrl = (token, resource) => {
  return makeRequest(token, {
    path:`/resources/download`,
    parameters: {
      path: resource
    }
  });
};

/**
 * Get resources tree
 * @param token
 * @param resource
 * @return {Promise<any>}
 */
const getResources = (token, resource = `/`) => {
  return makeRequest(token, {
    path:`/resources`,
    parameters: {
      path: resource
    }
  });
};

/**
 *
 * @param token
 * @param path
 * @param node
 * @return {Promise<any>}
 */
const getDirectoryTree = (token, path, node) => {
  return new Promise((accept, reject) => {
    getResources(token, path).then(d => {
      let promises = [];
      if (d._embedded && d._embedded.items) {
        d._embedded.items.forEach(item => {
          if (item.type === 'file') {
            let fileItem = {
              text: item.name,
              path,
              type: item.type
            };

            if (item.preview) fileItem.preview = item.preview;

            node.push(fileItem);
          } else if (item.type === 'dir') {
            let subtree = {
              text: item.name,
              path,
              nodes: [],
              type: item.type
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

/**
 *
 * @param token
 * @param url
 * @param name
 * @param path
 * @return {Promise<any>}
 */
const downloadFile = (token, url, name, path = 'D:/temp') => {
  return new Promise((accept, reject) => {
    const file = fs.createWriteStream(`${path}/${name}`);
    let urlpath = url.replace('https://downloader.disk.yandex.ru', '');
    let oauth = `OAuth ${token}`;

    let headers = {
      'authorization': oauth
    };
    const options = {
      hostname: `downloader.disk.yandex.ru`,
      port: 443,
      path: urlpath,
      method: 'GET',
      headers: headers
    };

    const req = https.request(options, res => {
      res.on('data', d => {
        if (d != null) {
          file.write(d);
        }
      });

      res.on('end', () => {
        accept();
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
};

module.exports = {
  downloadUrl,
  downloadFile,
  getDirectoryTree
};
