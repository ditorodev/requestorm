const Promise = require('promise');
const util = require('util');

class GSheet {
    constructor([driveService, sheetsService]){
        this.driveService = driveService;
        this.sheetsService = sheetsService;
        
    }
    /**
     * @param  {} title
     */
    async createSpreadsheet(title) {
        return new Promise((resolve, reject) => {
            const resource = {
              properties: {
                title,
              },
            };
            this.sheetsService.spreadsheets.create({
              resource,
              fields: 'spreadsheetId',
            }, (err, spreadsheet) =>{
              if (err) {
                console.log(err);
                reject(err);
              } else {
                resolve(spreadsheet.data.spreadsheetId);
              }
            });
          });
    }
    /**
     * Append Values to first sheet found in the Spreadsheet
     * @param  {string} spreadsheetId the spreadsheet id
     * @param  {string} range A1 notation of a range, without the sheet name
     * @param  {Array <String []>} values Array of values
     */
    async appendValues(spreadsheetId, range, values){
      return new Promise((resolve, reject) => {
        const data = {
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values
          }
        }
        this.sheetsService.spreadsheets.values.append(data, (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log(`${result.data.updates} cells appended.`);
            resolve(result.data);
          }
        });

      });
    }

    
}

module.exports = GSheet;