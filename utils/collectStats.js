const { differenceInDays } = require('date-fns');
const data = require('../JSONfromSQL/task_submit.json');

function roundNumber(number) {
   if (number === 0 || isNaN(number)) {
      return 0;
   }
   return Math.round(number * 100) / 100;
}

const variousInterval = {
   7: null,
   30: null,
   180: null,
   365: null,
   all: null
};

const variousIntervalStats = {
   7: {},
   30: {},
   180: {},
   365: {},
   all: {}
};

variousInterval.all = data;

variousInterval['7'] = data.filter(
   elem => differenceInDays(Date.now(), new Date(elem.date_uploaded)) <= 7
);

variousInterval['30'] = data.filter(
   elem => differenceInDays(Date.now(), new Date(elem.date_uploaded)) <= 30
);

variousInterval['180'] = data.filter(
   elem => differenceInDays(Date.now(), new Date(elem.date_uploaded)) <= 180
);

variousInterval['365'] = data.filter(
   elem => differenceInDays(Date.now(), new Date(elem.date_uploaded)) <= 365
);

//how many of them there are
Object.keys(variousInterval).forEach(
   key => (variousIntervalStats[key].amount = variousInterval[key].length)
);

//how many of them are in percent
Object.keys(variousIntervalStats).forEach(
   key =>
      (variousIntervalStats[key].percentOfAll = roundNumber(
         variousIntervalStats[key].amount / variousIntervalStats.all.amount
      ))
);

//how many of them are in percent relative to owns time
Object.keys(variousIntervalStats).forEach(key => {
   let counter = 0;
   variousInterval[key].forEach(elem => {
      if (elem.error_count === 0) {
         counter++;
      }
   });
   variousIntervalStats[key].goodAnswers = counter;
   variousIntervalStats[key].goodAnswersPercent = roundNumber(
      counter / variousIntervalStats[key].amount
   );
});

console.log(variousIntervalStats);
