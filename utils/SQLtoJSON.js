const fs = require('fs');
const path = require('path');
const util = require('util');
const _ = require('underscore');
const s = require('underscore.string');
const { writeConverted } = require('./korektor');

_.mixin(s.exports());

var errorEmpty = 'Please upload a file or type in something.',
   inQuotes = new RegExp(/(^`.*`$)|(^'.*'$)|(^".*"$)/);

function convert(sql) {
   if (sql.length == 0) throw errorEmpty;

   var matches = [];

   // Remove comments and empty lines, and collapse statements on one line
   sql = sql
      // Remove comments
      .replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1')
      .replace(/^--.*[\r\n]/gm, '')
      // Remove empty lines
      .replace(/^\s*[\r\n]/gm, '')
      // Collapse statements (TO DO: Convert this to a single regex)
      .replace(/;\s*[\r\n]/gm, ';;')
      .replace(/[\r\n]/gm, ' ')
      .replace(/;;\s?/gm, ';\n')
      // Extract quoted string values and replace with placeholders
      .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, function(m) {
         matches.push(_.trim(m, '\'"'));
         return "'{{" + (matches.length - 1) + "}}'";
      });

   //throw sql;
   var lines = _.lines(sql);
   if (lines.length == 0) throw errorEmpty;

   // Split into tables
   var tables = {},
      l,
      line;
   try {
      for (l = 0; l < lines.length; l++) {
         (line = lines[l]), (words = _.words(line));
         if (!words.length) continue;

         // CREATE TABLE [IF NOT EXISTS] <table> (<col>, ...)
         if (
            words.length >= 3 &&
            words[0].toUpperCase() == 'CREATE' &&
            words[1].toUpperCase() == 'TABLE'
         ) {
            var i = 2;
            while (!words[i].match(inQuotes) && i < words.length) i++;
            if (i >= words.length)
               throw 'Cannot find table name in CREATE TABLE statement.';
            var name = _.trim(words[i], '`\'"');
            tables[name] = {
               header: [],
               values: []
            };

            var values = _(line)
               .chain()
               .strRight('(')
               .strLeftBack(')')
               .words(',')
               .value();
            tables[name].header = _.reduce(
               values,
               function(result, value) {
                  var words = _.words(value);
                  if (!words.length) throw 'Cannot find columns for table ' + name;
                  var first = _.trim(words[0]);
                  if (
                     _.startsWith(first, "'") ||
                     _.startsWith(first, '`') ||
                     _.startsWith(first, '"')
                  )
                     result.push(_.trim(first, '`\'"'));
                  return result;
               },
               []
            );

            if (!tables[name].header.length) throw 'No columns found for table ' + name;
         }

         // INSERT INTO <table> VALUES (<cell>, ...)
         else if (
            words.length >= 4 &&
            words[0].toUpperCase() == 'INSERT' &&
            words[1].toUpperCase() == 'INTO' &&
            words[2].match(inQuotes) &&
            words[3].toUpperCase() == 'VALUES'
         ) {
            var name = _.trim(words[2], '`\'"');
            if (!tables[name])
               throw 'Table ' + name + ' was not defined in a CREATE TABLE.';
            var table = tables[name];

            var i = 3;
            while (words[i].toUpperCase() != 'VALUES' && i < words.length) i++;
            if (i == words.length || words[i].toUpperCase() != 'VALUES')
               throw 'Error parsing INSERT INTO statement. Cannot find VALUES.';
            i += 1;
            if (i == words.length)
               throw 'Error parsing INSERT INTO statement. No values found after VALUES.';

            var records = _.trim(words.slice(i).join(' '))
               .replace(/(\))\s*,\s*(\()/g, '),(')
               .replace(/^\(/, '')
               .replace(/\)\s*;?$/, '')
               .replace(/\(\s*(NULL)\s*/gi, '({{NULL}}')
               .replace(/,\s*(NULL)\s*/gi, ',{{NULL}}')
               .split('),(');

            _.each(records, function(str) {
               var values = _.words(str, ',');
               tables[name].values.push(
                  _.map(values, function(value) {
                     return _.trim(value, ' `\'"');
                  })
               );
            });
         }

         // INSERT INTO <table> (<col>, ...) VALUES (<cell>, ...), ...
         else if (
            words.length >= 4 &&
            words[0].toUpperCase() == 'INSERT' &&
            words[1].toUpperCase() == 'INTO' &&
            words[2].match(inQuotes) &&
            _.startsWith(words[3], '(')
         ) {
            var name = _.trim(words[2], '`\'"');
            if (!tables[name])
               throw 'Table ' + name + ' was not defined in a CREATE TABLE.';
            var table = tables[name];

            var i = 3;
            while (words[i].toUpperCase() != 'VALUES' && i < words.length) i++;
            if (i == words.length || words[i].toUpperCase() != 'VALUES')
               throw 'Error parsing INSERT INTO statement. Cannot find VALUES.';

            var cols = _.map(words.slice(3, i), function(value) {
               return _.trim(value, '(), `\'"');
            });
            if (!cols.length)
               throw 'Error parsing INSERT INTO statement. No column names found for table ' +
                  name +
                  ' in ' +
                  words[3];
            words[3];

            i += 1;
            if (i == words.length)
               throw 'Error parsing INSERT INTO statement. No values found after VALUES.';

            var records = _.trim(words.slice(i).join(' '))
               .replace(/(\))\s*,\s*(\()/g, '),(')
               .replace(/^\(/, '')
               .replace(/\)\s*;?$/, '')
               .replace(/\(\s*(NULL)\s*/gi, '({{NULL}}')
               .replace(/,\s*(NULL)\s*/gi, ',{{NULL}}')
               .split('),(');

            _.each(records, function(str) {
               var values = _.words(str, ',');
               /* if (values.length != cols.length)
							throw "Error parsing INSERT INTO statement. Values " + str + " does not have the same number of items as columns " + words[3]; */
               var record = {};
               _.each(tables[name].header, function(col) {
                  var index = _.indexOf(cols, col),
                     value = index != -1 ? _.trim(values[index], ' `\'"') : null;
                  record[col] = value;
               });
               tables[name].values.push(_.values(record));
            });
         }
      }
   } catch (error) {
      throw 'Error: ' + error + '\n...' + line;
   }

   // Convert to objects now and re-introduce quoted string values
   var objects = {};
   _.each(tables, function(table, name) {
      var keys = table.header;
      objects[name] = _.map(table.values, function(values) {
         var o = {};
         for (var k = 0; k < keys.length; k++) {
            o[keys[k]] =
               typeof values[k] == 'string'
                  ? values[k].replace(/^{{([0-9]+)}}$/, function(m, i) {
                       return matches[i];
                    })
                  : values[k];
            if (o[keys[k]] == '{{NULL}}') o[keys[k]] = null;
         }
         return o;
      });
   });

   return objects;
}

// test
const x = `  /**
* Continents 
*/
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for \`continents\`
-- ----------------------------
DROP TABLE IF EXISTS \`continents\`;
CREATE TABLE \`continents\` (
 \`code\` char(2) NOT NULL COMMENT 'Continent code',
 \`name\` varchar(255) DEFAULT NULL,
 PRIMARY KEY (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of continents
-- ----------------------------
INSERT INTO \`continents\` VALUES ('AF', 'Africa');
INSERT INTO \`continents\` VALUES ('AN', 'Antarctica');
INSERT INTO \`continents\` VALUES ('AS', 'Asia');
INSERT INTO \`continents\` VALUES ('EU', 'Europe');
INSERT INTO \`continents\` VALUES ('NA', 'North America');
INSERT INTO \`continents\` VALUES ('OC', 'Oceania');
INSERT INTO \`continents\` VALUES ('SA', 'South America');
`;

const y = `CREATE TABLE \`task_submit\` (
   \`id\` int(11) NOT NULL,
   \`id_user\` int(11) NOT NULL,
   \`id_task\` int(11) NOT NULL,
   \`date_uploaded\` datetime NOT NULL,
   \`error_count\` int(11) NOT NULL,
   \`warning_count\` int(11) NOT NULL,
   \`test_count\` int(11) NOT NULL,
   \`error_list\` longtext COLLATE utf8_unicode_ci,
   \`warning_list\` longtext COLLATE utf8_unicode_ci,
   \`test_list\` longtext COLLATE utf8_unicode_ci
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
 
 INSERT INTO \`task_submit\` (\`date_uploaded\`, \`error_count\`, \`test_count\`, \`test_list\`) VALUES
 ('2018-12-04 09:30:40', 0, 4, 
    '[
       "ID: 1 T: 0 F: ZwrocPodzielne P: System.Int32[]: [3,4,5,6,7,2,3]

    ]'),
 ('2018-12-04 09:23:22', 1, 4, 
    '[
       "ID: 1 T: 0 F: ZwrocPodzielne P: System.Int32[]: [3,4,5,6,7,2,3]
    ')
`;
/* const promisify = path => {
   return new Promise((accept, reject) => {
      fs.readdir(path, { reject, accept });
   });
};
 */
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);

const toJsonFromSQL = async () => {
   const sqlFolderPath = './sql';
   const sqlToJSONFolderName = './JSONfromSQL';
   const specifiedSQLFilePath = path.join(__dirname, '../', sqlFolderPath);
   let files;
   try {
      files = await readdir(specifiedSQLFilePath);
   } catch (err) {
      throw new Error("Something went wrong with folder's file names scanning!", err);
   }

   //check whether the folder exists, if not create new one
   stat(path.join(__dirname, '../', sqlToJSONFolderName), async (err, stats) => {
      if (err) {
         try {
            await mkdir(path.join(__dirname, '../', sqlToJSONFolderName));
         } catch (err) {
            throw new Error(err);
         }
      }
   });

   files.forEach(elem => {
      let pathName = path.join(specifiedSQLFilePath, elem);
      let readStream = fs.createReadStream(pathName, 'utf8');
      let data = '';
      readStream
         .on('data', function(chunk) {
            data += chunk;
         })
         .on('end', function() {
            const obj = convert(data);
            writeConverted(elem.replace('.sql', ''), obj[Object.keys(obj)[0]]);
         });
   });
};

toJsonFromSQL();

module.exports = { toJsonFromSQL };
