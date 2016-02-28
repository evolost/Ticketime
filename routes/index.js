var express = require('express');
var router = express.Router();
var db = require('../lib/db');

var myDate = new Date();
var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
var month = myDate.getMonth()+1;       //获取当前月份(0-11,0代表1月)
var date = myDate.getDate();        //获取当前日(1-31)
var nowDate = year + '-' + month + '-' + date;

/* GET home page. */
router.get('/', function(req, res, next) {
	var columns = ['name' ,'picsrc' ,'type' ,'mins' ,'language' ,'director' ,'actor' ,'f_href' ,'grade'];
	db.getLists(columns,'film_info',function(err, results) {
		//console.log('[results]'+results)
		    res.render('index', {
			  	title: 'Film',
			  	data : results,
			  	date : nowDate
			  });
		});
});

router.get('/tickets',function(req,res,next){
	var columns_price = ['price_id','c_id' ,'f_id' ,'p_id' ,'start_time' ,'end_time' ,'date' ,'standard' ,'price'];
	var columns_film = ['name' ,'picsrc' ,'type' ,'mins' ,'language' ,'director' ,'actor' ,'f_href' ,'grade'];
	var columns_cinema = ['c_name' ,'c_picsrc' ,'c_address' ,'c_area_id' ,'c_area' ,'c_href'];
	
	db.getLists(columns_price,'film_price',function(err,results){
		var prices = results;
		var price_data = [];
		console.log('len:'+prices.length);
		for(var i in prices){
			(function(idx){	
				db.findDate(columns_film,'film_info','f_id', prices[idx].f_id,function(err, results){
					var films = results[0];
					//console.log('films:' + films.name);
					db.findDate(columns_cinema,'cinema_info','c_id', prices[idx].c_id,function(err, results){
						var cinemas = results[0];
						//console.log('films:' + films.name);
						//console.log('【'+idx+'】'+prices[idx].price);
						price_data.push({
							price : prices[idx].price,
							name : films.name,
							c_name : cinemas.c_name,
							picsrc : films.picsrc,
							start_time : prices[idx].start_time,
							end_time : prices[idx].end_time,
							date : prices[idx].date,
							standard :'Gewara',
							mins : films.mins,
							f_href : films.f_href,
							c_address : cinemas.c_address,
							c_area : cinemas.c_area
						});
						if(idx == prices.length-1){
							res.render('tickets',{
								title : 'Tickets',
								date : nowDate,
								data : price_data
							})
						}
					});
				});		
			})(i)		
		}
		
		//console.log('[price_data_out]:'+price_data);
		
	})
})

module.exports = router;
