/**
 * @description <h5>Yandex Disk REST Api</h5>
 *
 *
 * @module yadisk
 */
const https = require('https');

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
const makeRequest = (token, options, method = 'GET') => {
  let {path = `/`, parameters, postParameters} = options;
  let parametersString = makeGetParameters(parameters);

  if (path.length > 0 && path.charAt(0) !== `/`) {
    path = `/${path}`;
  }

  return new Promise((accept, reject) => {
    const options = {
      hostname: `cloud-api.yandex.net`,
      port: 443,
      path: `/v1/disk${path}${parametersString}`,
      method,
      headers: {
        'authorization': `OAuth ${token}`
      }
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
 * @return {*}
 */
const getDiskInfo = token => {
  return makeRequest(token);
};

const getResources = (token, resource = `/`) => {
  return makeRequest(token, {
    path:`/resources`,
    parameters: {
      path: resource
    }
  });
};

module.exports = {
  getDiskInfo,
  getResources
};
