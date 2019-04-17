'use strict';
const GSheets = require('./src/sheets');
const {
  google
} = require('googleapis');
const firebase = require('firebase');
const {Core} = require('../firebase/core');
const jwt = require('jsonwebtoken');



// function initGoogle(email) {
//   generateKey(email);
// }

function createResponse(statusCode, body) {
  return {
    statusCode,
    body
  }
}

function buildAuthClient(tokens) {
    const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_SECRET_CLIENT_ID,
    'https://localhost:3000/oauth2callback'
  );
  oauth2Client.setCredentials(tokens);


  return oauth2Client;
}

function createSheetsService(authClient) {


  const services = [
    google.drive({
      version: 'v3',
      auth: authClient
    }), google.sheets({
      version: 'v4',
      auth: authClient
    }),
  ];


  return new GSheets(services);
}


module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
};

module.exports.createSpreadsheet = async (event, context) => {
  if (!params.userId) {
    return createResponse(401, {
      message: 'No user token provided'
    });
  } else if (!body.name) {
    return createResponse(400, {
      message: 'No name provided'
    });
  }
  const params = event.pathParameters;
  const body = event.body;
  const db = new Core(firebase);

/// BEFORE EVERYTHING WE SHOULD CHECK FOR TOKENREFRESH :)
  const google_tokens = await db.getUserTokens(params.userId) ;// search google token in firebase
  const authClient = buildAuthClient(google_tokens);
  authClient.on('tokens', (tokens) => {
    if(tokens.refresh_token) {
      console.log('updated tokens');
      db.writeUserData(tokens.access_token, tokens.refresh_token);
    }
  })


  const sheets = createSheetsService(authClient); // here we create the google sheet service to mkae disasteeeer
  const spreadsheetId = await sheets.createSpreadsheet(body.name);

  return createResponse(
    200, {
      message: 'Spreadsheet created succesfully',
      spreadsheetId
    }
  );
};

module.exports.postToSheets = async (event, context) => {
  const params = event.pathParameters;
  if(!params.userToken) {
    return createResponse(401, {
      message: 'No user token provided'
    });
  }

  //now we append the data




};