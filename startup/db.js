const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');
require('dotenv').config();

/* console.log(config.util.getEnv('NODE_CONFIG_DIR'));
console.log(process.cwd()) */

//Connect to MongoDB
module.exports = function() {
   mongoose
      .connect(config.get('mongoUrl'), { useNewUrlParser: true, useFindAndModify: false })
      .then(() =>
         winston.info(
            `MongoDB connected, ${
               process.env.NODE_ENV === 'production' ||
               process.env.NODE_ENV === 'development'
                  ? 'Production DB'
                  : 'Test DB'
            }`
         )
      );
};
