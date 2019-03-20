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

    it('should append a row in spreadsheet', mochaAsync(async () => {
      const testSpreadsheet = await sheets.createSpreadsheet('Example');
      

    }))
})