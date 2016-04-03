/*
处理JS动态生成页面
 */
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

//var url = 'http://m.gewara.com/movie/m/choiceMovieSim.xhtml?cid=100795420&mid=284316908&openDate=2016-3-14';
var fs = require('fs');
//获取需要采集的url列表
casper.start(url,function(){	
	casper.GetDetailUrl(url);
});

//打开具体url并处理具体页面
casper.GetDetailUrl = function(detailUrl){
	casper.thenOpen(detailUrl,function(){
		casper.wait(140,function(){
			casper.then(function(){
				fs.write('./public/tempData',this.getHTML('.ui_opiTime'),'w');
				//fs.write('./public/tempData_old', fs.read('./public/tempData'));
			})
		})
	})
};

casper.run();