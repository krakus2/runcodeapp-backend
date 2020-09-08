const winston = require('winston');

module.exports = function() {
   winston.add(winston.transports.File, { filename: 'logfile.log' });

   process
      .on('unhandledRejection', ex => {
         winston.error(ex);
      })
      .on('uncaughtException', ex => {
         winston.log('error', ex);
         process.exit(1);
      });
};
