//const casual = require('casual');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const splitArray = (inputArray, perChunk) => {
   return inputArray.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);

      if (!resultArray[chunkIndex]) {
         resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
   }, []);
};

module.exports = {
   //valid data
   taskData: {
      imieINazwisko: "Filip 'test' Krakowiak",
      tytulZadania: 'Zadanie Testowe nr 1',
      opisZadania: 'Opis zadania testowego',
      nazwaFunkcji: 'zadTest',
      iloscArg: 2,
      iloscWynikow: 2,
      args: ['Tablica []', 'int', 'Typ prosty', 'int'],
      returnArgs: ['Typ prosty', 'int'],
      code: `
         public static void Main()
            {
               Student Student = new Student();
               Console.WriteLine("Student details - {0}", Student);
               Student.Name = "BOB";
               Student.Age = 99;
            }
      `,
      wyniki: ['1,2,4,3,6,4,8,9', '2', '4', '1,3,0,6,4,-8,2', '-2', '1'],
      czyRekurencja: false,
      czyPrzeczytano: false
   },
   taskDataFromDB: {
      args: ['Tablica []', 'int', 'Typ prosty', 'int'],
      returnArgs: ['Typ prosty', 'int'],
      wyniki: ['1,2,4,3,6,4,8,9', '2', '4', '1,3,0,6,4,-8,2', '-2', '1'],
      date: `${new Date().toISOString()}`,
      czyPrzeczytano: false,
      _id: `${new ObjectId()}`,
      imieINazwisko: "Filip 'test' Krakowiak",
      nazwaFunkcji: 'zadTest',
      tytulZadania: 'Zadanie Testowe nr 1',
      opisZadania: 'Opis zadania testowego',
      iloscArg: 2,
      iloscWynikow: 2,
      code: `
         public static void Main()
            {
               Student Student = new Student();
               Console.WriteLine("Student details - {0}", Student);
               Student.Name = "BOB";
               Student.Age = 99;
            }
      `,
      czyRekurencja: false,
      __v: 0
   },
   //data with too short task description
   //API should throw an error
   taskDataError: {
      imieINazwisko: "Filip 'test' Krakowiak",
      tytulZadania: 'Zadanie Testowe nr 1',
      opisZadania: 'Opis',
      nazwaFunkcji: 'zadTest',
      iloscArg: 2,
      iloscWynikow: 2,
      args: ['Tablica []', 'int', 'Typ prosty', 'int'],
      returnArgs: ['Typ prosty', 'int'],
      code: `
         public static void Main()
            {
               Student Student = new Student();
               Console.WriteLine("Student details - {0}", Student);
               Student.Name = "BOB";
               Student.Age = 99;
            }
      `,
      wyniki: ['1,2,4,3,6,4,8,9', '2', '4', '1,3,0,6,4,-8,2', '-2', '1'],
      czyRekurencja: false,
      czyPrzeczytano: false
   },

   taskDataErrors1: {
      imieINazwisko: '',
      tytulZadania: '',
      opisZadania: 'Opis',
      nazwaFunkcji: '',
      iloscArg: 6,
      iloscWynikow: 0,
      args: undefined,
      returnArgs: undefined,
      code: ``,
      wyniki: undefined,
      czyRekurencja: undefined,
      czyPrzeczytano: undefined
   },

   taskDataErrors2: {
      imieINazwisko:
         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tempus dui id iaculis tristique. Pellentesque id',
      tytulZadania:
         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tempus dui id iaculis tristique. Pellentesque id',
      opisZadania: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tempus dui id iaculis tristique. 
         Pellentesque id ultricies tellus. Proin dignissim metus ligula, vitae aliquam tortor sollicitudin posuere. Curabitur at odio sed massa feugiat mattis. 
         Sed erat leo, fringilla eget mi ut, tristique varius purus. 
         Quisque tempor quam in felis scelerisque, vitae bibendum leo ultrices. Cras auctor mollis elit, eu porta purus.
         Sed tincidunt sit amet diam vel pellentesque. Ut tempor consequat posuere. Nulla facilisi. Vestibulum arcu turpis, 
         varius a sapien sed, mattis cursus odio. Praesent porta eu tortor quis interdum. Nunc scelerisque consectetur metus eget venenatis. 
         Maecenas in sagittis arcu.`,
      nazwaFunkcji:
         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tempus dui id iaculis tristique. Pellentesque id',
      iloscArg: 6,
      iloscWynikow: 0,
      args: undefined,
      returnArgs: undefined,
      code: ``,
      wyniki: undefined,
      czyRekurencja: undefined,
      czyPrzeczytano: undefined
   },
   taskDataErrors3: {
      imieINazwisko: null,
      tytulZadania: null,
      opisZadania: null,
      nazwaFunkcji: null,
      iloscArg: null,
      iloscWynikow: null,
      args: null,
      returnArgs: null,
      code: null,
      wyniki: null,
      czyRekurencja: null,
      czyPrzeczytano: null
   },

   taskDataErrors4: {
      imieINazwisko: undefined,
      tytulZadania: undefined,
      opisZadania: undefined,
      nazwaFunkcji: undefined,
      iloscArg: undefined,
      iloscWynikow: undefined,
      args: undefined,
      returnArgs: undefined,
      code: undefined,
      wyniki: undefined,
      czyRekurencja: undefined,
      czyPrzeczytano: undefined
   },

   taskDataErrors5: {
      imieINazwisko: [],
      tytulZadania: [],
      opisZadania: [],
      nazwaFunkcji: [],
      iloscArg: [],
      iloscWynikow: [],
      args: [],
      returnArgs: [],
      code: [],
      wyniki: [],
      czyRekurencja: [],
      czyPrzeczytano: []
   },
   taskDataErrors6: {
      imieINazwisko: [],
      tytulZadania: [],
      opisZadania: [],
      nazwaFunkcji: [],
      iloscArg: [],
      iloscWynikow: [],
      args: [],
      returnArgs: [],
      code: [],
      wyniki: [null],
      czyRekurencja: [],
      czyPrzeczytano: []
   },
   types: splitArray(
      [
         'int',
         'System.Int32',
         'double',
         'System.Double',
         'float',
         'System.Float',
         'decimal',
         'System.Decimal',
         'long',
         'System.Int64',
         'short',
         'System.Int16',
         'string',
         'System.String',
         'char',
         'System.Char',
         'bool',
         'System.Boolean',
         'byte',
         'System.UInt8'
      ],
      2
   ),
   utilsData1: [
      '2',
      2,
      null,
      '',
      undefined,
      '',
      NaN,
      '',
      { a: 'a', b: 'b' },
      '',
      [12, 23],
      '',
      132,
      '',
      '4',
      4,
      '-2',
      -2,
      '1',
      1,
      '6',
      6,
      '3',
      3,
      '0',
      0,
      '*',
      '*',
      '4',
      4,
      '0',
      0,
      '4',
      4,
      '3',
      3,
      'ala',
      'ala',
      'true',
      'true',
      'kajak',
      'kajak',
      'true',
      'true',
      'a',
      'a',
      'true',
      'true',
      'ola',
      'ola',
      'false',
      'false',
      'ela',
      'ela',
      'false',
      'false'
   ],
   utilsData2: [
      '',
      [],
      1,
      [],
      null,
      [],
      undefined,
      [],
      NaN,
      [],
      { a: 'a', b: 'b' },
      [],
      [12, 23],
      [],
      '1,2,4,  3,6,4, 8,  9',
      [1, 2, 4, 3, 6, 4, 8, 9],
      '1,  3,0, 6,4,-8,2',
      [1, 3, 0, 6, 4, -8, 2],
      '-2,  -8,  -32,2, 8,8',
      [-2, -8, -32, 2, 8, 8]
   ]
};
