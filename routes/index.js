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

	var columns = ['f_id','name' ,'picsrc' ,'type' ,'mins' ,'language' ,'director' ,'actor' ,'f_href' ,'grade'];
	db.getLists(columns,'film_info',function(err, results) {
		//console.log('[results]'+results)
		    res.render('index', {
			  	title: 'Ticketime - 时光电影票',
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

router.get('/linkList',function(req,res,next){
	var msql = "select c_area,group_concat(c_name),group_concat(c_id) from cinema_info group by c_area;";
	//三级联动查询
	db.useSql(msql, function (err,results) {
		if(err) return;
		var areaJson = [];
		//构造二维数组
		areaJson['dist'] = [];
		var c_names = [];
		var areaJsons = [];
		results.forEach(function(result){
			c_names[result.c_area] = [];
			var tempNames = result['group_concat(c_name)'].split(",");
			var tempIDs = result['group_concat(c_id)'].split(",");
			var len = tempIDs.length;
			for(var i = 0; i < len ; i++){
				c_names[result.c_area].push({
					cit : tempNames[i],
					cid : tempIDs[i]
				})
			}
		});

		//console.log(JSON.stringify(c_names['六合区']));
		results.forEach(function (result) {
			areaJson['dist'].push({
				//目前测试城市为一个
				//c:"南京市",
				//d:[{
					dt:result.c_area,
					cim:c_names[result.c_area]
				//}]

			});
			//console.log(result.c_area);
		});
		//重新构造新数组
		areaJsons.push({
			c:"南京",
			d:areaJson['dist']
		})
		//console.log(JSON.stringify(areaJsons));
		res.send(JSON.stringify(areaJsons));
	})

})

router.post('/priceJson',function(req,res,next){
	//console.log('[CinemaID:]' + req.body.selectedCinemaID + '[FilmID:]' + req.body.selectedFilmID);
	var c_id = req.body.selectedCinemaID;
	var f_id = req.body.selectedFilmID;
	var price_sql = 'select price_id,start_time,end_time,date,standard,price from film_price where c_id = '+c_id+' and f_id = '+f_id+' order by start_time;';
	//console.log(price_sql);
	db.useSql(price_sql,function(err,result){
		if(err) return;
		//console.log(result);
		res.json(JSON.stringify(result));
	})
	//db.findDate(['price_id','price'],'film_price','c_id',c_id, function (err,result) {
	//	if(err) return;
	//	//console.log(JSON.stringify(result));
	//	res.json(JSON.stringify(result));
	//})
	//res.json({success:1});
})

module.exports = router;
