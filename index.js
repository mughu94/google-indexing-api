const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

// If modifying these SCOPES, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/indexing'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const LOG_PATH = path.join(__dirname, 'log.txt');
const CLIENT_SECRET_PATH = path.join(__dirname, 'client_secret.json');

// Function to fetch keywords from output.json
async function fetchKeywords() {
  try {
    const response = await axios.get('keywords.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return [];
  }
}

// Function to check if a keyword has already been submitted
function isSubmitted(keyword) {
  if (!fs.existsSync(LOG_PATH)) {
    return false;
  }

  const logData = fs.readFileSync(LOG_PATH, 'utf8');
  return logData.includes(keyword);
}

/**
 * Load client secrets from a local file.
 */
fs.readFile(CLIENT_SECRET_PATH, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), processKeywords);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {function} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Process keywords and call the Indexing API.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function processKeywords(auth) {
  const indexing = google.indexing({
    version: 'v3',
    auth
  });

  const keywords = await fetchKeywords();
  
  for (const keyword of keywords) {
    const formattedKeyword = keyword.replace(/\s+/g, '-');
    if (!isSubmitted(formattedKeyword)) {
      const urlToIndex = `https://mughu.id/${encodeURIComponent(formattedKeyword)}`;

      const request = {
        'url': urlToIndex,
        'type': 'URL_UPDATED'
      };

      indexing.urlNotifications.publish({
        requestBody: request
      }, (err, response) => {
        const logStream = fs.createWriteStream(LOG_PATH, { flags: 'a' });
        if (err) {
          console.error(err);
          logStream.write(`[ERROR] ${new Date().toISOString()} - ${err.message}\n`);
        } else {
          console.log('URL submitted:', response.data);
          logStream.write(`[SUCCESS] ${new Date().toISOString()} - Keyword: ${formattedKeyword}, URL submitted: ${JSON.stringify(response.data)}\n`);
        }
        logStream.end();
      });
    } else {
      console.log(`Keyword "${formattedKeyword}" has already been submitted.`);
    }
  }
}
