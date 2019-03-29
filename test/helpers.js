const Promise = require('promise');
const util = require('util');
const googleapis = require('googleapis');
const GoogleAuth = require('google-auth-library');


class Helpers {
    constructor() {
        const client = this.buildAuthClient();
        this.sheetsService = client.then((auth) => googleapis.google.sheets({
            version: 'v4',
            auth
        })).catch(err => console.log(err));
        this.driveService = client.then((auth) => googleapis.google.drive({
            version: 'v3',
            auth
        })).catch(err => console.log(err));;
        this.filesToDelete = [];
    }

    /**
     * Builds the Google Auth Client
     * NOTE: needs the credentials from Console API, for testing you need a "service account key" for your project.
     * Download them and setup an environment variable like export GOOGLE_APPLICATION_CREDENTIALS="<PATH_TO_CREDENTIALS>"
     * @return {Promise} A promise to return the auth client.
     */
    buildAuthClient() {
        return new Promise(async (resolve, reject) => {
            let scopes = [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/spreadsheets',
            ];
            const client = await GoogleAuth.auth.getClient({
                scopes: scopes
            });

            if (client != null) resolve(client);
        });
    }
    /**
     * Gets all cells values from an entire row.
     * @param  {string} spreadsheetId The spreadsheet id.
     * @param  {number} rowN The row number in the spreadsheet where we want to get cells.
     */
    getRow(spreadsheetId, rowN) {
        return this.sheetsService.then((sheets) => {
            const get = Promise.denodeify(sheets.spreadsheets.values.get).bind(sheets.spreadsheets);
            let range = `${rowN}:${rowN}`;
            let value = {
                spreadsheetId,
                range
            };

            
            return get(value);
        }).then((result) => {
            return result.data;
        });
    }
}

module.exports = Helpers;