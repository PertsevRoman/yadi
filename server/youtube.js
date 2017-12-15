const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const youtube = google.youtube('v3');

const config = JSON.parse(fs.readFileSync('./server/youtube.json').toString());

const REDIRECT_URL = `https://new.sdoetru.ru:3000/api/third-party/youtube`;
const auth = new googleAuth();
const oauth2 = new auth.OAuth2(config.client.client_id, config.client.client_secret, REDIRECT_URL);
oauth2.credentials = config.credentials;

const scopes = [
  `https://www.googleapis.com/auth/youtube`,
  `https://www.googleapis.com/auth/youtube.upload`,
  `https://www.googleapis.com/auth/youtube.readonly`,
  `https://www.googleapis.com/auth/youtube.force-ssl`
];

/**
 * Generate accept rights url
 * @return {string}
 */
const generateUrl = () => {
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
};

/**
 *
 * @param fileDir
 * @param fileName
 * @return {Promise<any>}
 */
const uploadVideo = (fileDir, fileName) => {
  const resource = fileDir.charAt(-1) === `/` || fileDir === `/` ? `${fileDir}${fileName}` : `${fileDir}/${fileName}`;
  const fileSize = (fs.statSync(resource).size / 1024 / 1024).toFixed(2);

  return new Promise((accept, reject) => {
    console.log(`upload start ${resource}`);
    let inval = null;

    let req = youtube.videos.insert({
      auth: oauth2,
      part: `snippet,status`,
      resource: {
        snippet: {
          title: fileName.replace(/\.[a-zA-Z]*/g, ''),
          description: `Super description`,
          tags: [
            `sepia`, `ffmpeg`
          ],
          categoryId: 22
        },
        status: {
          privacyStatus: `private`,
          embeddable: true
        }
      },
      notifySubscribers: false,
      media: {
        body: fs.createReadStream(resource)
      }
    }, (err, response) => {
      if (err) {
        reject(err);
      }

      accept(response);
    });

    inval = setInterval(() => {
      let uploaded = (req.req.connection._bytesDispatched / 1024 / 1024).toFixed(2);

      console.log(`${uploaded}MB of ${fileSize}MB uploaded`);

      if (inval && uploaded + 0.01 > fileSize) {
        console.log(`file uploaded, wait for response`);
        clearInterval(inval);
      }
    }, 1000);
  });
};

/**
 *
 * @return {Promise<any>}
 */
const getVideos = () => {
  return new Promise((accept, reject) => {
    youtube.channels.list({
      auth: oauth2,
      part: 'contentDetails',
      mine: true
    }, function(err, response) {
      if (err) {
        reject(err);
      }

      const mineChannels = response.items;
      const uploadsPlaylistId = mineChannels[0].contentDetails.relatedPlaylists.uploads;

      youtube.playlistItems.list({
        auth: oauth2,
        part: 'contentDetails,snippet,id',
        maxResults: 50,
        playlistId: uploadsPlaylistId
      }, (err, response) => {
        if (err) {
          reject(err);
        }

        const uploadedVideos = response.items;
        accept(uploadedVideos);
      });
    });
  });
};

module.exports = {generateUrl, getVideos, uploadVideo};
