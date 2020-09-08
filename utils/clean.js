const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(myPath) {
   if (fs.existsSync(myPath) && fs.lstatSync(myPath).isDirectory()) {
      //existsSync - sprawdza czy dana ścieżka istnieje, asynchroniczna wersja jest deprecated na rzecz fs.stat()
      //fs.lstatSync zwraca ten sam obiekt co fs.stat, gdzie można sprawdzić szczegóły na temat pliku
      fs.readdirSync(myPath).forEach(function(file, index) {
         const curPath = path.join(myPath, file);

         if (fs.lstatSync(curPath).isDirectory()) {
            // recurse
            deleteFolderRecursive(curPath);
         } else {
            // delete file
            fs.unlinkSync(curPath);
         }
      });

      console.log(`Deleting directory "${myPath}"...`);
      fs.rmdirSync(myPath);
   }
}

if (process.argv.length <= 2) {
   console.log('Wskaż, który folder chcesz usunąć');
   process.exit(-1);
}
const args = process.argv.slice(2);
console.log('Cleaning working tree...');

deleteFolderRecursive(args[0]);

console.log('Successfully cleaned working tree!');
