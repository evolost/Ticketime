var cheerio = require("cheerio");
var request = require("request");
var path = require('path');
var fs = require('fs');
var db = require('./db');
var server = require("./curl");
var async = require('async');
var Nightmare = require('nightmare');

//gewara Links
var root_url = 'http://m.gewara.com';
var furl = 'http://www.gewara.com/movie/searchMovie.xhtml?pageNo=';
var curl = 'http://www.gewara.com/movie/searchCinema.xhtml?pageNo=';

var getAjaxData = function (platform,url,selector,waitSelector,callback){
	var nightmare = Nightmare({
		show: false,
	})
	if(platform == 'gewaraFilm'){
		//获取影片
		nightmare
			.useragent('Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36')
			.goto(url)
			.wait(800)
			.click('#pullUpHot')
			.wait(1500)
			.click('#pullUpHot')
			.wait(1500)
			.click('#pullUpHot')
			.wait(1500)
			.click('#pullUpHot')
			.wait(1500)
			.wait(waitSelector)
			.evaluate(function (selector) {
				return document.querySelector(selector).innerHTML;
			},selector)
			.end()
			.then(function(content){
				callback(content)
			})
	}else if(platform == 'gewaraCinema'){
		nightmare
			.useragent('Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36')
			.goto(url)
			.wait(800)
			.scrollTo(1000, 0)
			.wait(1500)
			.scrollTo(2000,0)
			.wait(1500)
			.scrollTo(3000,0)
			.wait(1500)
			.scrollTo(4000,0)
			.wait(1500)
			.scrollTo(5000,0)
			.wait(1500)
			.scrollTo(6000,0)
			.wait(1500)
			.scrollTo(7000,0)
			.wait(1500)
			.wait(waitSelector)
			.evaluate(function (selector) {
				return document.querySelector(selector).innerHTML;
			},selector)
			.end()
			.then(function(content){
				callback(content)
			})
	}else if(platform == 'gewaraPrice'){
		nightmare
			.useragent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
			.goto(url)
			//.inject('js', 'jquery.js')
			.wait(800)
			.wait(selector)
			.evaluate(function (selector) {
				return document.querySelector(selector).innerHTML;
				//return !!window.jQuery;
			},selector)
			.end()
			.then(function(content){
				callback(content)
			})
	}else if(platform == 'maoyan'){
		nightmare
			.useragent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
			.goto(url)
			//.inject('js', 'jquery.js')
			.wait(800)
			.wait(selector)
			.evaluate(function (selector) {
				return $(selector).html();
				//return !!window.jQuery;
			},selector)
			.end()
			.then(function(content){
				callback(content)
			})
	}
}


//Gewara
exports.getFilmID = function(){
	//var root_url = 'http://m.gewara.com';
	//采集影片列表
	getAjaxData('gewaraFilm',root_url,'#hotlist','#hotlist',function(result){
		var info = [];
		var $ = cheerio.load(result);
		$('li').each(function(){
			var fid = $(this).find('.content').attr('href').match(/Id=(.*)\&/)[0].replace(/Id=|\&/g,"");
			var fname = $(this).find('.title > b').text();
			var curl = 'http://m.gewara.com/movie/m/choiceCinema.xhtml?mid=' + fid;
			info.push({
				f_id:fid,
				fname:fname,
				curl:curl
			})
		});
		//console.log(info);

		//采集影片对应的上映影院列表
		var count = 0;
		var currencyCount = 0;
		async.mapLimit(info,5,function(dat,callback){
			currencyCount++;
			console.log('【'+(++count)+'】现在的并发数是',currencyCount, '，正在处理' + dat.curl);
			getAjaxData('gewaraCinema',dat.curl,'#loadCinema','#loadCinema',function(result){
				var info = [];
				var $ = cheerio.load(result);
				$('.togglePriceLink').each(function(){
					var cid = $(this).attr('id');
					var cname = $(this).find('.clear > b').text();
					var href = root_url + $(this).attr('href');
					info.push({
						f_id:dat.f_id,
						fname:dat.fname,
						c_id:cid,
						cname:cname,
						p_url:href
					})
				});
				db.saveData(info,'gewara_Info');
				//db.insertData('cinema_all','gewara','c_id','all_name',info,function(err,result){
				//    if(err) return;
				//    console.log('完成'+result.length+'数据操作');
				//})
			});
			setTimeout(function(){
				currencyCount--;
				callback(null,dat.curl)
			},15000)
		},function(err,result){
			console.log('已完成' + result.length +'条影片信息处理')
		})
	})

}

exports.getPrice = function(){
	db.getAllLists("gewara_Info",function(err,result){
		var i = 0;
		async.mapLimit(result,2,function(data,callback){
			console.log(data.p_url);
			getAjaxData('gewaraPrice',data.p_url,'.ui_opiTime','.ui_opiTime',function (result) {
				var $ = cheerio.load(result);
				var info = [];
				if($('.ui_accordionNotice').length){
					console.log('time out!');
					return;
				}
				$('.box').each(function(){
					var id = $(this).find('a').attr('href').match(/\d*$/)[0];//购买场次唯一id
					var price = $(this).find('.price > b').text();
					var time_s = $(this).find('.time > b').text();
					var time_e = $(this).find('.time > em').text().substr(0,5);
					var standard =  $(this).find('.room >b').text();
					console.log('【'+(++i)+'】' + id);
					info.push({
						//price_id : id,//价格id
						price : price,//影片价格
						start_time : time_s,//开始时间
						end_time : time_e,//散场时间
						standard : standard,//规格标准（2D/3D/IMAX.../Language）
						c_id : data.c_id,//影院id
						f_id : data.f_id,//影片id
						date : '2016-4-4',//购票日期
						p_id : '1'//平台id
					});
				});
				db.saveData(info,'film_price');
				//console.log('success!');
			});
			setTimeout(function(){
				callback(null,data.p_url);
			},2500);
		},function(err,result){
			console.log('已完成' + result.length +'家影院上映信息处理');
		})
	})
}

//抓取电影院数据
exports.getCinameData = function(){
	for(var i = 0; i < 7; i++){
		urls = curl + i;
		//urls = allurl + i + '&order=clickedtimes&movietime=all';
		server.getData(urls,function(data){
			if(data){
				var $ = cheerio.load(data);
				var info = [];
				$('.effectLi').each(function(){
					getCinamePageInfo(info,$(this));
				});

				setTimeout(db.saveData(info,'cinema_info'), parseInt(Math.random() * 2000));
			}else{
				console.log('error');
			}
		})
		console.log('获取站点第'+(i+1)+'页数据成功');
	}
}
//抓取当前平台上映电影数据
exports.getFilmData = function(page_from,page_to){
	//var page_to = 20;
	for(var i = page_from-1; i < page_to; i++){
		var urls = furl + i;
		server.getData(urls,function(data){
			if(data){
				var $ = cheerio.load(data);
				var info = [];
				$('.effectLi').each(function(){
					getFilmPageInfo(info,$(this));
				});
				setTimeout(db.saveData(info,'film_info'), parseInt(Math.random() * 2000));
			}else{
				console.log('error');
			}
		})
		console.log('获取站点第'+(i+1)+'页数据成功');
	}
}

//处理影院单页数据
var getCinamePageInfo = function(arr,$$){
	var that = $$.children()
	var picsrc = that.find('img').css('background').match(/\((.*)\)/)[0].replace(/\(|\)/g,"");
	var title = that.find('.color3').attr('title');
	var address = that.find('.mt10').text().replace(/\s+/g,"").match(/\](.*)\[/)[0].replace(/\[|\]/g,"");
	var area_id = that.find('.c999').attr('href').match(/\d*$/)[0];
	var area = that.find('.c999').text().replace(/\[|\]/g,"");
	var c_href = that.find('.color3').attr('href');
	c_href = formatHref(c_href);
	var c_id = c_href.match(/\d*$/)[0];
	arr.push({
		c_id : c_id,//id
		c_picsrc : picsrc,//影院logo地址
		c_name : title,//影院名称
		c_address : address,//影院地址
		c_area_id : area_id,//影院行政区域id
		c_area : area,//影院行政区域
		c_href : c_href//影院链接
	});

}

//处理影片单页数据
var getFilmPageInfo = function(arr,$$){
	var that = $$.children().find('.ui_text').children();
	var grade = that.find('sub').text() + that.find('sup').text();
	var picsrc = $$.children().find('img').attr('src');
	var filmhref = $$.children().find('.color3').attr('href');
	filmhref = formatHref(filmhref);
	//匹配末尾film_id
	var film_id = filmhref.match(/\d*$/)[0];
	var title = $$.children().find('.color3').attr('title');
	arr.push({
		f_id : film_id,//id
		name : title,//影名
		type : that.eq(-6).text().substr(3),//类型
		picsrc : picsrc,//封面海报地址
		language : that.eq(-5).text().substr(3),//语言
		mins : that.eq(-4).text().substr(3),//时长
		director : that.eq(-3).text().substr(3),//导演
		actor : that.eq(-2).text().substr(3),//主演
		grade : grade,//评分
		f_href : filmhref //链接地址
	})
};
var formatHref = function(href){
	var rootsite = 'http://www.gewara.com';
	return(rootsite + href);
}


