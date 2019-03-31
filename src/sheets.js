const Promise = require('promise');
const util = require('util');

class GSheet {
    constructor([driveService, sheetsService]){
        this.driveService = driveService;
        this.sheetsService = sheetsService;
        
    }

     /**
     * Transform a normal range to A1 Notation
     * @param  {Object} range Range following this 
     * {
     *  firstRow,
     *  lastRow,
     *  firstColumn,
     *  lastColumn
     * }
     * @return {String} Range in A1 notation
     * @throws Error when there is a number bigger than 26 in a column
     */
    normalToA1Notation(range) {
      if(range.startColumnIndex > 26|| range.endColumnIndex > 26) throw new Error('To much columns for a sheet.');
      
      const dictionary = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; //Number to letter
      let columns, rows;
      columns = [dictionary[range.startColumnIndex || 0], dictionary[range.endColumnIndex ? range.endColumnIndex : (range.startColumnIndex || 0)]]; // If no firstColumn is provided we take the first, and if no lastColumn is provided we use the firstColumn value
      rows = [range.startRowIndex && range.startRowIndex != 0? range.startRowIndex.toString() : '1', range.endRowIndex && range.endRowIndex != 0? range.endRowIndex.toString() : (range.startRowIndex && range.startRowIndex != 0? range.startRowIndex.toString() : '1')]; // If no firstRow is provided we take the first, and if no lastRow is provided we use the firstRow value

      if((range.startColumnIndex === undefined) && (range.startRowIndex != undefined)) {
        return rows[0] + ':' + rows[1];
      } else if((range.startRowIndex === undefined) && (range.startColumnIndex != undefined)){
        return columns[0] + ':' + columns[1];
      }

      return (columns[0] + rows[0] + ':' + columns[1] + rows[1]);
  }

    /**
     * Make an Update to the Spreadseet
     * @param  {String} spreadsheetId SpreadsheetID to update
     * @param  {Object[]} resources Array with all the operations
     * @return {Promise<any>} Promise with result
     */
    async batchUpdate(spreadsheetId, resources){
      return new Promise((resolve, reject) => {
        let resource = {
          requests: [],
        }
        resources.map((req) => resource.requests.push(req));
         const data = {
           spreadsheetId,
           resource
         };
        this.sheetsService.spreadsheets.batchUpdate(data, (err, response) => {
           if(err) {
             console.log(err);
             reject(err);
           } else {
             const result = response.data;
             resolve(result);
           }
         });
      }); 
    }
    /**
     * Creates a Spreadsheet
     * @param  {String} title Spreadsheet title
     * @return {Promise<any>} Promise with SpreadsheetId
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
     * @return {Promise<any>} Promise with AppendResponse from google sheets api v4
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
            resolve(result.data);
          }
        });

      });
    }
    /**
     * Creates a Protected Range
     * @param  {String} spreadsheetId The Spreadsheet ID
     * @param  {Object} range Range following next object
     * "range": {
            "sheetId": sheetId,
            "startRowIndex": 0,
            "endRowIndex": 3,
            "startColumnIndex": 0,
            "endColumnIndex": 5,
          }
      @return {Promise<any>} Promise with BatchUpdateResponse form google sheets api v4
     */
    async createProtectedRange(spreadsheetId, range){
      const resource = [{
            addProtectedRange: {
              protectedRange:{
                range,
                warningOnly: true,
              },
            }
        }];

      return this.batchUpdate(spreadsheetId, resource).then((data) => data.replies[0].addProtectedRange.protectedRange);
    }
    /**
     * Creates a named range.
     * @param  {String} spreadsheetId The Spreadsheet ID.
     * @param  {String} rangeName Name of the Range.
     * @param  {Object} range Range we want to name.
     * @return {Promise<any>} namedRange object.
     */
    async createNamedRange(spreadsheetId, rangeName, range) {
      const resource = [{
        addNamedRange: {
          namedRange: {
            range,
            name: rangeName
          }
        }
      }];

      return this.batchUpdate(spreadsheetId, resource).then((data) => data.replies[0].addNamedRange.namedRange);
    }

    /**
     * Format spreadsheet to receive data.
     * - Sets protected row of parameters.
     * - Sets named column for each parameter.
     * @param  {String} spreadsheetId The Spreadsheet ID.
     */
    async formatSpreadsheet (spreadsheetId) {

    }
}

module.exports = GSheet;