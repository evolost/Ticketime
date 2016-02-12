var mysql = require('mysql');
var db  = mysql.createPool({
	connectionLimit : 50,
	host            : 'localhost',
	user            : 'ticket',
	password        : 'root',
	database 		  : 'ticket',
	charset		  : 'utf8'
});

module.exports = db;