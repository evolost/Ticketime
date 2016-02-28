var express = require('express');
var router = express.Router();
var db = require('../lib/db');

/* GET home page. */
router.get('/', function(req, res, next) {
	db.getConnection(function(err,connection){
		if(err){
			console.error('error pooconnecting:' + err.stack);
			return;
		}
		var columns = ['name' ,'picsrc' ,'type' ,'mins' ,'country' ,'start_date' ,'director' ,'actor' ,'f_href'];
		connection.query('SELECT ?? FROM ??', [columns, 'film_info'], function(err, results) {
		    res.render('index', {
			  	title: 'Ticket',
			  	data : results
			  });
		});
	})
});

module.exports = router;
