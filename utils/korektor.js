const fs = require('fs');
const path = require('path');
const util = require('util');

const korektor = data => {
   return (corrected = data.map(elem => {
      const obj = {
         ...elem
      };
      obj.error_count = parseInt(elem.error_count);
      obj.test_count = parseInt(elem.test_count);
      if (elem.test_list.length > 1) {
         let test_list = elem.test_list.split(/\"ID/);
         test_list.shift();
         test_list = test_list.map(elem_list =>
            `ID${elem_list.trim()}`.replace(/\\\\|\",|\"]/g, '')
         );
         obj.test_list = test_list;
      }
      return obj;
   }));
};

const mkdir = util.promisify(fs.mkdir);

const writeConverted = (name, data) => {
   const sqlToJSONFolderName = './JSONfromSQL';
   const sqlToJSONFileName = `${name}.json`;
   const specifiedFilePath = path.join(
      path.join(__dirname, '../'),
      sqlToJSONFolderName,
      sqlToJSONFileName
   );

   //correct data and save to the file
   fs.writeFile(specifiedFilePath, JSON.stringify(korektor(data), null, '\t'), err => {
      if (err) throw new Error(err);
      console.log('complete');
   });
};

module.exports = { writeConverted };
