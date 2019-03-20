const Promise = require('promise');

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
                console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
                resolve(spreadsheet.data.spreadsheetId);
              }
            });
          });
    }

    /**
     * Gets all cells values from an entire row.
     * @param  {string} spreadsheetId The spreadsheet id.
     * @param  {number} rowN The row number in the spreadsheet where we want to get cells.
     */
      async getRow(spreadsheetId, rowN){
      return new Promise ((resolve, reject) => {
          let range = `${rowN}:${rowN}`;
          let value = {
              spreadsheetId,
              range
          };
  
          this.sheetsService.spreadsheets.values.get(value, (err, result)=> {
              if( err ){
                  reject(err);
              } else {
                  resolve(result);
              }
          });
      }); 
  }
}

module.exports = GSheet;