const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const youtube = google.youtube('v3');

const config = JSON.parse(fs.readFileSync('./server/youtube.json').toString());

const REDIRECT_URL = `https://sdoetru.ru/api/third-party/youtube`;
const auth = new googleAuth();
const oauth2 = new auth.OAuth2(config.client.client_id, config.client.client_secret, REDIRECT_URL);
oauth2.credentials = config.credentials;

const scopes = [
  `https://www.googleapis.com/auth/youtube.force-ssl`,
  `https://www.googleapis.com/auth/youtube.upload`,
  `https://www.googleapis.com/auth/youtube.readonly`
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

module.exports = {generateUrl, getVideos};
