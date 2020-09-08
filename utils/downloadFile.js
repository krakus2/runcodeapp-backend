const fs = require('fs');
const path = require('path');
const taskRouteUtils = require('./tasksRouteUtils');
const server = require('../index');
const { zipTrescFunc, zipTestyFunc } = taskRouteUtils;

const apiCall = async () => {
   const zadania = await zipTrescFunc();
   const testy = await zipTestyFunc();

   const testsPath = path.join(__dirname, '..', 'daneDoTestow');
   ensureExists(testsPath, 0744, function(err) {
      //tworzy nowy folder z testami
      if (err) throw err;
      else console.log(`Created new folder - ${testsPath}`);
   });

   fs.writeFile(
      path.join(testsPath, 'tresciZadan.json'),
      JSON.stringify(zadania, null, '\t'),
      function(err) {
         if (err) throw err;
         console.log('Saved file with tasks content');
      }
   );

   testy.forEach(zadanie => {
      const nazwaPliku = `${zadanie[0]}.json`;
      const tablicaTestow = [];
      for (let i = 1; i < zadanie.length; i++) {
         tablicaTestow.push(zadanie[i]);
      }
      fs.writeFile(
         `${testsPath}/${nazwaPliku}`,
         JSON.stringify(tablicaTestow, null, '\t'),
         err => {
            if (err) throw err;
            console.log(`Saved file with tests content ${testsPath}\\${nazwaPliku}`);
         }
      );
   });
   return server.close();
};

function ensureExists(path, mask, cb) {
   if (typeof mask == 'function') {
      // allow the `mask` parameter to be optional
      cb = mask;
      mask = 0777;
   }
   fs.mkdir(path, mask, function(err) {
      if (err) {
         if (err.code == 'EEXIST') cb(null);
         // ignore the error if the folder already exists
         else cb(err); // something else went wrong
      } else cb(null); // successfully created folder
   });
}

apiCall();
