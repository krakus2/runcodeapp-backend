const hexToRgb = hex =>
   hex
      .replace(
         /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
         (m, r, g, b) => '#' + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map(x => parseInt(x, 16));

const addAlphaChannel = (color, a) => `rgba(${hexToRgb(color).join(', ')}, ${a})`;

function subtractFunc(date) {
   return Math.round((Date.now() - new Date(date)) / (1000 * 3600 * 24));
}

function getSqlYear(d) {
   return `${d.getFullYear()}-${
      d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1
   }-${d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()}`;
}

const resolveDataToLineChart = (sqlData, fromValue, task_id) => {
   const data = {
      id: task_id,
      /* color: '#3F51B5', */
      data: []
   };

   const d = new Date();

   if (sqlData.length) {
      const subtract = subtractFunc(sqlData[sqlData.length - 1].date_uploaded);
      const howMany = fromValue === 'all' ? (subtract > 365 ? subtract : 365) : fromValue;

      for (let i = 0; i < howMany; i++) {
         d.setDate(d.getDate() - 1);
         data.data.push({
            x: getSqlYear(d),
            y: 0
         });
      }
      sqlData.forEach((elem, i) => {
         const index = subtractFunc(elem.date_uploaded);
         if (index - 1 < data.data.length - 1) {
            data.data[index - 1].y++;
         }
      });

      const max = data.data.reduce((acc, curr) => {
         if (curr.y > acc) {
            acc = curr.y;
         }
         return acc;
      }, 0);

      data.max = max;
   } else {
      for (let i = 0; i < fromValue; i++) {
         d.setDate(d.getDate() - 1);
         data.data.push({
            x: getSqlYear(d),
            y: 0
         });
      }
   }
   return data;
};

const resolveDataToPieChart = sqlData => {
   const data = [
      { id: 'sukces', label: 'sukces', value: 0, color: 'green', all: 0 },
      { id: 'porażka', label: 'porażka', value: 0, color: '#f50057', all: 0 }
   ];

   for (let i = 0; i < sqlData.length; i++) {
      data[0].all++;
      data[1].all++;
      if (sqlData[i].error_count === 0) {
         data[0].value++;
      } else {
         data[1].value++;
      }
   }
   return data;
};

const resolveDataToBarChart = sqlData => {
   if (sqlData.length) {
      const data = sqlData.reduce((acc, elem, i, array) => {
         if (i === 0) {
            acc.push([{ ...elem }]);
         } else {
            if (array[i].id_user !== array[i - 1].id_user) {
               acc.push([{ ...elem }]);
            } else {
               acc[acc.length - 1].push({ ...elem });
            }
         }
         return acc;
      }, []);

      const statsObj = {
         success1: 0,
         defeat1: 0,
         success2: 0,
         defeat2: 0,
         success3: 0,
         defeat3: 0
      };

      data.forEach((elem, i) => {
         if (elem[0] !== undefined) {
            if (elem[0].error_count === 0) {
               statsObj.success1++;
            } else {
               statsObj.defeat1++;
            }
         }
         if (elem[1] !== undefined) {
            if (elem[1].error_count === 0) {
               statsObj.success2++;
            } else {
               statsObj.defeat2++;
            }
         }
         if (elem[2] !== undefined) {
            if (elem[2].error_count === 0) {
               statsObj.success3++;
            } else {
               statsObj.defeat3++;
            }
         }
      });
      const returnData = [];
      for (let i = 0; i < 3; i++) {
         returnData.push({
            attempt: `${i + 1} próba`,
            /* attemptColor: addAlphaChannel('#009688', '0.8'), */
            value: Math.round(
               (statsObj[`success${i + 1}`] /
                  (statsObj[`success${i + 1}`] + statsObj[`defeat${i + 1}`])) *
                  100
            ),
            counter: statsObj[`success${i + 1}`] + statsObj[`defeat${i + 1}`]
         });
      }
      return returnData;
   } else {
      return [
         { attempt: '1 próba', value: 0 },
         { attempt: '2 próba', value: 0 },
         { attempt: '3 próba', value: 0 }
      ];
   }
};

const resolveDataToBarChart2 = (sqlData, from, to) => {
   if (sqlData.length) {
      console.log(sqlData.length);
      let data = sqlData.reduce((acc, elem, i, array) => {
         if (i === 0) {
            acc.push([{ ...elem }]);
         } else {
            if (array[i].id_user !== array[i - 1].id_user) {
               acc.push([{ ...elem }]);
            } else {
               acc[acc.length - 1].push({ ...elem });
            }
         }
         return acc;
      }, []);
      const ile = data.reduce((acc, elem) => {
         acc += elem.length;
         return acc;
      }, 0);
      console.log(ile);

      //TODO - spytac czy usuwanie takich z pustym test_list jest okej,
      //prawdopodobnie trzeba bedzie to jakos przerobic, bo te errory w polu error_list
      //moga swiadczyc o niepoprawnie wykonanym zadaniu
      data = data
         .map(elem =>
            elem.reduce((acc, elem2) => {
               if (elem2.test_count !== 0) {
                  acc.push({
                     ...elem2,
                     test_list: JSON.parse(elem2.test_list)
                  });
               }
               return acc;
            }, [])
         )
         .filter(elem => elem.length > 0);

      const ile2 = data.reduce((acc, elem) => {
         acc += elem.length;
         return acc;
      }, 0);
      console.log(ile2);
      console.log(data[0]);

      const reg1 = /ID: [0-9]+/g;
      const reg2 = /F: \w+/g;
      const reg3 = /T: [01]{1}/g;
      const returnData = data[0][0].test_list.map(elem => {
         const obj = {};
         obj.ID = elem.match(reg1)[0].substring(4);
         obj.nazwaFunkcji = elem.match(reg2)[0].substring(3);
         obj.parametry = elem.substring(elem.indexOf('P:') + 3, elem.indexOf('O:') - 1);
         obj.sukces = 0;
         obj.sukcesColor = addAlphaChannel('#009688', '0.8');
         obj.porazka = 0;
         obj.porazkaColor = '#f50057';
         return obj;
      });
      returnData.sort((elem1, elem2) => {
         return Number(elem1.ID) > Number(elem2.ID);
      });
      let counter = 0;
      //console.log(returnData);
      data.forEach((elem, i) => {
         for (let index = from; index <= to; index++) {
            //console.log(index);
            if (elem[index - 1] !== undefined) {
               elem[index - 1].test_list.forEach(test => {
                  if (
                     !!test.match(reg3) &&
                     Number(test.match(reg3)[0].substring(3)) === 1
                  ) {
                     //console.log(++counter);
                     !!test.match(reg1) &&
                        returnData[Number(test.match(reg1)[0].substring(4)) - 1].sukces++;
                  } else {
                     /* console.log(
                        !!test.match(reg1) && Number(test.match(reg1)[0].substring(4)) - 1
                     ); */
                     !!test.match(reg1) &&
                        returnData[Number(test.match(reg1)[0].substring(4)) - 1]
                           .porazka--;
                  }
               });
            } else {
               console.log(++counter);
            }
         }
      });

      return returnData;
   } else {
      return [
         { ID: '1', sukces: 0, porazka: 0 },
         { ID: '2', sukces: 0, porazka: 0 },
         { ID: '3', sukces: 0, porazka: 0 },
         { ID: '4', sukces: 0, porazka: 0 }
      ];
   }
};

module.exports = {
   resolveDataToLineChart,
   resolveDataToPieChart,
   resolveDataToBarChart,
   resolveDataToBarChart2
};
