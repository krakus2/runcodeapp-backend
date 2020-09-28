const mysql = require('mysql')
const config = require('config')

const db = mysql.createConnection({
  host: config.get('sqlHost') || 'db4free.net',
  user: config.get('sqlUser') || 'runcodeapp',
  password: config.get('sqlPassword'),
  database: config.get('sqlDatabase') || 'runcodeapp',
})

db.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack)
    return
  }
  console.log('connected as id ' + db.threadId)
})

module.exports = db
