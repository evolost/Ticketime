var system = require('system');
var url = system.args[4];
var casper = require('casper').create({
	//clientScripts: ["./public/javascripts/jquery-1.11.1.min.js"],
	verbose:false,
	logLevel:'debug',
	pageSettings: {
		loadPlugins:false,
	    loadImages:  false, // 不加载图片，减少请求
	    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
	}
});
phantom.outputEncoding = 'gbk';//解决乱码问题
//cookies
phantom.addCookie({
    name: 'Hm_lpvt_8c7313b43793ee561c89b311e22045da',
    value: '1456750590',
    domain: '.m.gewara.com',
    path: '/',
    secure: false,
    httponly: false,
    expires: Date.now() + (1000 * 60 * 60 * 24 * 5)
});
//var url = 'http://m.gewara.com/movie/m/choiceMovieSim.xhtml?cid=40342719&mid=258698741&openDate=2016-03-03';
//var url = 'date.html';
var fs = require('fs');
//var x = require('casper').selectXPath;
//获取需要采集的url列表
casper.start(url,function(){	
	casper.GetDetailUrl(url);
});

//打开具体url并处理具体页面
casper.GetDetailUrl = function(detailUrl){
	casper.thenOpen(detailUrl,function(){
		casper.wait(120,function(){
			casper.then(function(){
				fs.write('./public/tempData',this.getHTML('.ui_opiTime'),'w');
			})
		})
	})
};

//处理具体页面
// casper.wait(200,function(){
// 	casper.then(function getDate() {

		//fs.write('date.html',this.getHTML(),'w');
		//this.capture('getPrice.png');

	   	//product = casper.evaluate(function getDateFromPage(){
	   		/*拼接数据
			var elements= __utils__.findAll(".box > a");  
	        var list=[];    
	        for(var i=0; i<elements.length; i++){
				var id = elements[i].getAttribute('href').match(/\d*$/)[0];
	        	var time_s = elements[i].querySelector('.time > b').textContent.replace(/\s/g,'');
	        	var time_e = elements[i].querySelector('.time > em').textContent.substr(0,5);
	        	var price = elements[i].querySelector('.price > b').textContent;
	        	var standard = elements[i].querySelector('.room > b').textContent.replace(/\s/g,'');
	            //__utils__.echo('【elements】'+time_e);  
	            list.push({
	            	price_id : id,//价格id
					price : price,//影片价格
					start_time : time_s,//开始时间
					end_time : time_e,//散场时间
					standard : standard//规格标准（2D/3D/IMAX.../Language）
	            });
	            //
	        }*/

	        
	        /*return Array.prototype.forEach.call(elements, function(e) { 
	            return e.getAttribute('href'); 
	        });*/  


	   	    /*return [].map.call(__utils__.findAll('.box > a'), function(e) {  
		        //__utils__.echo(node.getAttribute('href'));  
		        return e.getAttribute('href');
		    });*/
			
		    //return list;
		//});
	   	
		// var data = this.getHTML('.ui_opiTime');
		// fs.write('./public/tempData',data,'w');
		// this.echo(data);

		//casper.PostData(data);
	   	// for(var i in product){
	   	// 	casper.PostData(product[i]);
	   	// }

		// var item = new Object();
		// item.title = product;
		// item.murl = this.getCurrentUrl();
		
// 	});
// })


/*
提交信息到服务器
*/
/*
casper.PostData = function(item) {
	casper.open('http://ticket.studentech.cn/admin').then(function() {
	this.fill('form#price_form', {
		'price_id': item
		// 'price': item.price,
		// 'start_time': item.start_time,
		// 'end_time': item.end_time,
		// 'price_id': item.price_id,
		// 'standard': item.standard,


	}, false);
	this.capture('post.png');
	this.click("#btnSave");
	//this.echo('GOT it1.' + item.price_id);
	});
	this.wait(50, function() {
	this.echo("I've waited for a second.");
	});
}
*/
casper.run();