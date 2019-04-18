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

async function createSheetsService(userId, db) {

  const google_tokens = await db.getUserTokens(userId) ;// search google token in firebase
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_SECRET_CLIENT_ID,
    'https://localhost:3000/oauth2callback'
  );
  oauth2Client.setCredentials(google_tokens);
  
  
  oauth2Client.on('tokens', (tokens) => {
    if(tokens.refresh_token) {
      console.log('updated tokens');
      db.writeUserData(tokens.access_token, tokens.refresh_token, userId);
    }
  })  



  const services = [
    google.drive({
      version: 'v3',
      auth: oauth2Client
    }), google.sheets({
      version: 'v4',
      auth: oauth2Client
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
  const params = event.pathParameters;
  const body = event.body;

      if (!params.userId) {
        return createResponse(401, {
          message: 'No user token provided'
        });
      } else if (!body.name) {
        return createResponse(400, {
          message: 'No name provided'
        });
      }

  const db = new Core(firebase);
  let token;

  const sheets = await createSheetsService(params.userId, db); // here we create the google sheet service to mkae disasteeeer
  const spreadsheetId = await sheets.createSpreadsheet(body.name);
  
  if(spreadsheetId != undefined) {
    token = jwt.sign({
      spreadsheetId,
      userId: params.userId
    },process.env.SECRET_);

    db.writeSpreadsheetData(params.userId, spreadsheetId, body.name, token);
  }

  return createResponse(
    200, {
      message: 'Spreadsheet created succesfully',
      spreadsheetId,
      name: body.name,
      token
    }
  );
};

module.exports.postToSheets = async (event, context) => {
  const params = event.pathParameters;
  const body = event.body;
  if(!params.userToken) {
    return createResponse(401, {
      message: 'No user token provided'
    });
  } else if(!body){
    return createResponse(401, {
      message: 'At least one parameter should be provided'
    });
  }

  try{
    const token_payload = jwt.verify(params.userToken, process.env.SECRET_);
    const db = new Core(firebase);
    const sheets = await createSheetsService(token_payload.userId, db);
    const spreadsheetDbId = await db.getSheetReference(token_payload.spreadsheetId);
    const isWrotten = await db.db.ref('sheet/' + spreadsheetDbId).once('value').then((snapshot) => snapshot.child('params').exists());
    let paramsToSheets, protectedRange, sheetsApiRes, res;


    if(!isWrotten){
      paramsToSheets = Object.keys(body);    
      protectedRange = sheets.createProtectedRangeReq({
        startRowIndex: 1,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 1
      });
    }

    let values = [];
    let valuesRanges = [];
    let i = 0;
    for(let key in body) {

      let req = sheets.createNamedRangeReq(key, {
        startColumnIndex: i,
        endColumnIndex: i,
      });

      values.push(body[key]);
      valuesRanges.push(req);
      i++;
    }


    //now we append the data
    
    // if it is first wrotten we append the params
    if(!isWrotten){
      res = await sheets.appendValues(token_payload.spreadsheetId, 'A1:C1000',[paramsToSheets,values]);
      sheetsApiRes = await sheets.batchUpdate(token_payload.spreadsheetId,[protectedRange, ...valuesRanges]);
      // save params ranges in db
      for(let rep in sheetsApiRes.replies){
        if(sheetsApiRes.replies[rep].addProtectedRange != undefined) continue;
        await db.createNewRange(token_payload.spreadsheetId, 
          sheetsApiRes.replies[rep].addNamedRange.namedRange.namedRangeId, 
          sheetsApiRes.replies[rep].addNamedRange.namedRange.name, false);
          console.log(sheetsApiRes.replies[rep].addNamedRange.namedRange.name);
      }
    } else { // else we only append values
      res = await sheets.appendValues(token_payload.spreadsheetId, 'A1:C1000',[values]);
    } 

    
    
    return createResponse(200, {
      message: 'Information added correctly'
    });

  } catch (err) {
    console.log(err);
    return createResponse(401, {
      message: 'Token is invalid'
    });
  }



};