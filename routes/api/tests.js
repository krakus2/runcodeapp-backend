const express = require('express');
const router = express.Router();
const LRU = require('lru-cache');
const testsRouteUtils = require('../../utils/testsRouteUtils');
const db = require('../../startup/sqldb');

const {
   resolveDataToLineChart,
   resolveDataToPieChart,
   resolveDataToBarChart,
   resolveDataToBarChart2
} = testsRouteUtils;

const options = {
   max: 500,
   maxAge: 1000 * 60 * 15
};

const cache = new LRU(options);

// @route   GET api/tests
// @desc    get tasks from sql database
// @access  Public
router.get('/', (req, res) => {
   const result = new Set();
   //const result = {};
   //const resultSet = new Set();
   if (cache.has('tests')) {
      return res.json(cache.get('tests'));
   } else {
      db.query('SELECT * FROM `task_submit`', function(error, results, fields) {
         //TODO - czy ten widok nie powinien byc bardziej szczegolowy, np. zamiast samych ID
         //tytuly tych zadan
         if (error) throw new Error('Something went wrong');
         if (results.length !== 0) {
            results.forEach((elem, i) => {
               result.add(elem.id_task);
               /*if (result[elem.id_task] === undefined) {
                  result[elem.id_task] = [];
                  //resultSet.add(elem.id_task);
                  result[elem.id_task].push(elem.id_task);
               }  else if (!resultSet.has(elem.id_task)) {
                  result[elem.id_task].push(elem);
               } */
            });
            cache.set('tests', Array.from(result).sort((x, y) => x - y));
            return res.json(cache.get('tests'));
         } else {
            return res.json({});
         }
      });
   }
});

// @route   GET api/tests/task_id=:id&test_date=:date&from_value=:fromValue
// @desc    get specified portion of tests data
// @access  Public
router.get('/task_id=:id&test_date=:date&from_value=:fromValue', (req, res) => {
   const { id, date, fromValue } = req.params;
   if (cache.has(`id=${id}&from_value=${fromValue}`)) {
      console.log('no elo z kesza');
      return res.json(cache.get(`id=${id}&from_value=${fromValue}`));
   } else {
      if (date !== 'all') {
         db.query(
            `SELECT * FROM \`task_submit\` WHERE id_task=${id} AND date_uploaded >= '${date}' ORDER by id_user`,
            function(error, results, fields) {
               if (error) throw new Error('Something went wrong');
               cache.set(`id=${id}&from_value=${fromValue}`, [
                  resolveDataToLineChart(results, fromValue, id),
                  resolveDataToPieChart(results, fromValue),
                  resolveDataToBarChart(results)
               ]);
               return res.json(cache.get(`id=${id}&from_value=${fromValue}`));
            }
         );
      } else {
         db.query(
            `SELECT * FROM \`task_submit\` WHERE id_task=${id} ORDER by id_user`,
            function(error, results, fields) {
               if (error) throw new Error('Something went wrong');
               cache.set(`id=${id}&from_value=${fromValue}`, [
                  resolveDataToLineChart(results, fromValue, id),
                  resolveDataToPieChart(results),
                  resolveDataToBarChart(results)
               ]);
               return res.json(cache.get(`id=${id}&from_value=${fromValue}`));
            }
         );
      }
   }
});

// @route   GET api/tests/task_id=:id&test_date=:date&from=:from&to=:to
// @desc    get specified portion of tests data 2
// @access  Public
router.get('/task_id=:id&test_date=:date&from=:from&to=:to', (req, res) => {
   const { id, date, from, to } = req.params;
   if (cache.has(`id=${id}&date=${date}&from=${from}&to=${to}`)) {
      console.log('no elo z kesza2');
      return res.json(cache.get(`id=${id}&date=${date}&from=${from}&to=${to}`));
   } else {
      if (date !== 'all') {
         db.query(
            `SELECT * FROM \`task_submit\` WHERE id_task=${id} AND date_uploaded >= '${date}' ORDER by id_user`,
            function(error, results, fields) {
               if (error) throw new Error('Something went wrong');
               cache.set(
                  `id=${id}&date=${date}&from=${from}&to=${to}`,
                  resolveDataToBarChart2(results, from, to)
               );
               return res.json(cache.get(`id=${id}&date=${date}&from=${from}&to=${to}`));
            }
         );
      } else {
         db.query(
            `SELECT * FROM \`task_submit\` WHERE id_task=${id} ORDER by id_user`,
            function(error, results, fields) {
               if (error) throw new Error('Something went wrong');
               cache.set(
                  `id=${id}&date=${date}&from=${from}&to=${to}`,
                  resolveDataToBarChart2(results, from, to)
               );
               return res.json(cache.get(`id=${id}&date=${date}&from=${from}&to=${to}`));
            }
         );
      }
   }
});

module.exports = {
   router
};
