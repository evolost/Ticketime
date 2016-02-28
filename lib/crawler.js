var cheerio = require("cheerio");
var request = require("request");
var path = require('path');
var fs = require('fs');
var db = require('./db');
var server = require("./curl");

//var aurl = 'http://www.gewara.com/nanjing';
//var murl = 'http://m.gewara.com/movie/m/choiceMovieSim.xhtml?cid=213959236&mid=224406330&openDate=2016-01-24';
var allurl = 'http://www.gewara.com/movie/searchMovieStore.xhtml?pageNo=';
//http://www.gewara.com/movie/searchMovieStore.xhtml?pageNo=1&order=releasedate&movietime=all
//var url = 'http://www.gewara.com/movie/searchMovie.xhtml?pageNo=';

exports.getPageData = function(page_from, page_to){
	//var page_to = 20;
	for(var i = page_from-1; i < page_to; i++){
		//urls = url + i;
		urls = allurl + i + '&order=clickedtimes&movietime=all';
		server.getData(urls,function(data){
			if(data){
				var $ = cheerio.load(data);
				var info = [];
				$('.effectLi').each(function(){
					getFilmInfo(info,$(this));
				});
				
				setTimeout(saveData(info), parseInt(Math.random() * 2000));
			}else{
				console.log('error');
			}
		})
		console.log('获取站点第'+(i+1)+'页数据成功');
	}
}
//格式化地址
var formatHref = function(href){
	var rootsite = 'http://www.gewara.com';
	return(rootsite + href);
}

//格式化时间
var formatMins = function(str){
	var res = str.replace(/\s/g,'');
}


//处理单页数据
var getFilmInfo = function(arr,$$){
	var that = $$.children().find('.ui_text').children();
	var picsrc = $$.children().find('img').attr('src');
	var filmhref = $$.children().find('.color3').attr('href');
	filmhref = formatHref(filmhref);
	//匹配末尾film_id
	var film_id = filmhref.match(/\d*$/)[0];
	var title = $$.children().find('.color3').attr('title');
	arr.push({
		// f_id : film_id,//id
		// name : title,//影名
		// type : that.eq(-6).text().substr(3),//类型
		// picsrc : picsrc,//封面海报地址
		// language : that.eq(-5).text().substr(3),//语言
		// mins : that.eq(-4).text().substr(3),//时长
		// director : that.eq(-3).text().substr(3),//导演
		// actor : that.eq(-2).text().substr(3),//主演
		// f_href : filmhref //链接地址
		f_id : film_id,//id
		name : title,//影名
		start_date : that.eq(-7).text().substr(5),//上映时间
		type : that.eq(-6).text().substr(5),//类型
		country : that.eq(-5).text().substr(6),//国家
		picsrc : picsrc,//封面海报地址
		language : that.eq(-4).text().substr(3),//语言
		//过滤所有空格
		mins : that.eq(-3).text().substr(3).replace(/\s/g,''),//时长
		director : that.eq(-2).text().substr(3),//导演
		actor : that.eq(-1).text().substr(3),//主演
		f_href : filmhref //链接地址
	})	
};

var saveData = function(data){
	var len = data.length;
	db.getConnection(function(err,connection){
		if(err){
			console.error('error pooconnecting:'+err.stack);
			return;
		}
		if(len){
			for(var i in data){
				connection.query('INSERT INTO film_info SET ?',data[i],function(err,result){
					if(err){
						throw err;
					}
				})
			}
			connection.release();
			console.log('save success!')
		}
	});
}