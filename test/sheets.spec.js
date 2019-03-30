const Sheets = require('../src/sheets');
const Helpers = require('./helpers');
const Promise = require('promise');
const expect = require('expect');

const mochaAsync = (fn) => {
    return (done) => {
      fn.call().then(done, (err) => {
        done(err);
      });
    };
  };

describe('Helper Functions', () => {
  let snippets;
  before((done) => {
      snippets = new Sheets([null, null]);
      done();
  });

  it('should transform a complete normal range to A1 Notation', () => {
    const range = {
      startColumnIndex: 0,
      endColumnIndex: 10,
      startRowIndex: 0,
      endRowIndex: 10
    }

    const conversion = snippets.normalToA1Notation(range);
    expect(conversion).toEqual('A1:K10');
  });

  it('should transform a normal range without first row and column to A1 Notation', () => {
    const range = {
      endColumnIndex: 10,
      endRowIndex: 10
    }

    const conversion = snippets.normalToA1Notation(range);
    expect(conversion).toEqual('A1:K10');
  })

  it('should transform a normal range without last row and column to A1 Notation', () => {
    const range = {
      startColumnIndex: 0,
      startRowIndex: 0,
    }

    const conversion = snippets.normalToA1Notation(range);
    expect(conversion).toEqual('A1:A1');
  });

  it('should transform a one row range without to A1 Notation', () => {
    const range = {
      startRowIndex: 0,
    }

    const conversion = snippets.normalToA1Notation(range);
    expect(conversion).toEqual('1:1');
  });

  it('should transform a one column range without to A1 Notation', () => {
    const range = {
      startColumnIndex: 0,
    }

    const conversion = snippets.normalToA1Notation(range);
    expect(conversion).toEqual('A:A');
  })
});

describe('Spreadsheet Snippets', () => {
    const helpers = new Helpers();
    let snippets;

    before((done) => {
      Promise.all([
        helpers.driveService,
        helpers.sheetsService,
      ]).then((services) => {
        snippets = new Sheets(services);
        done();
      }).catch(done);
    });

    afterEach(() => {
      // return helpers.cleanup();
    });

    beforeEach(() => {
      // helpers.reset()
    }); 

    it('should create a spreadsheet', mochaAsync(async () => {
      const id = await snippets.createSpreadsheet('Title');
      expect(id).toBeDefined();
    }));

    it('should append a row of cell values in spreadsheet', mochaAsync(async () => {
      const testSpreadsheet = await snippets.createSpreadsheet('Example');
      const values = [
        ['A', 'B', 'C']
      ];
      const range = "1:1"; // First row
      const result = await snippets.appendValues(testSpreadsheet, range, values);
      const resValues = await helpers.getRow(testSpreadsheet, 1);
      expect(result.updates.updatedRows).toBe(1);
      expect(result.updates.updatedColumns).toBe(3);
      expect(result.updates.updatedCells).toBe(3);
      expect(resValues.values).toEqual(values);
    }));

    it('should create a protected range', mochaAsync(async () =>{
      const testSpreadsheet = await snippets.createSpreadsheet('Example');
      const range = {
        endRowIndex: 1,
        startRowIndex: 1
      }; // First Row
      const result = await snippets.createProtectedRange(testSpreadsheet, range);
      expect(result.protectedRangeId).toBeDefined();
      expect(result.range).toEqual(range);
    }));

    it('should create a named range', mochaAsync(async ()=>{
      const testSpreadsheet = await snippets.createSpreadsheet('Example');
      const range = {
        startColumnIndex: 0,
        startRowIndex: 0,
        endRowIndex: 1
      }
      const result = await snippets.createdNamedRange(testSpreadsheet, 'Name1', range);
    }));



    it('should format a spreadsheet', mochaAsync(async () => {
      const testSpreadsheet = await snippets.createSpreadsheet('Example');
      await snippets.formatSpreadsheet(testSpreadsheet);
    }));
})