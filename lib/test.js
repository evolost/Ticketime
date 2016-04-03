var cheerio = require('cheerio');
var async = require('async');
var db = require('./db');
var getAjaxData = function(url,selector,waitSelector,callback){
    var Nightmare = require('nightmare');
    var nightmare = Nightmare({
        show: true,
    })
    nightmare
        .useragent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
        .goto(url)
        //.inject('js', 'jquery.js')
        .wait(100)
        .wait(waitSelector)
        .evaluate(function (selector) {
            return document.querySelector(selector).innerHTML;
            //return $(selector).html();
            //return !!window.jQuery;
        },selector)
        .end()
        .then(function(content){
            //console.log(content);
            callback(content)
        })
}
getAjaxData('http://m.gewara.com/movie/m/choiceMovieSim.xhtml?cid=247896358&mid=253497365&openDate=2016-04-04','.ui_opiTime','.ui_opiTime',function(result){
    $ = cheerio.load(result);
    var i = 0;
    console.log(result);
    $('.box').each(function () {
        var id = $(this).find('a').attr('href').match(/\d*$/)[0];//购买场次唯一id
        console.log('【'+(++i)+'】' + id);
    })

});

/*
    MaoYanFilm
*/

/*
//获取基本信息
var root_url = 'http://m.maoyan.com/';
getAjaxData(root_url,'.movie-list','.movie-list',function(result){
    var info = [];
    var $ = cheerio.load(result);
    $('li').each(function(){
        if($(this).attr('class') != 'coming'){
            var fid = $(this).find('.item').attr('href').match(/e\/(.*)\?/)[0].replace(/e\/|\?/g,"");
            var fname = $(this).find('h4 span:first-child').text();
            var curl = 'http://m.maoyan.com/?tmp=showcinemas&movieid=' + fid;
            info.push({
                fname:fname,
                curl:curl
            })
        }
    });
    var count = 0;
    var currencyCount = 0;
    async.mapLimit(info,5,function(dat,callback){
        currencyCount++;
        console.log('【'+(++count)+'】现在的并发数是',currencyCount, '，正在处理' + dat.curl);
        getAjaxData(dat.curl,'#showcinemas','.cinemas-list',function(result){
            var info = [];
            var $ = cheerio.load(result);
            $('.mj-dropdown-hd').each(function(){
                //var area = $(this).text().substr(0,3);
                $(this).siblings('ul').find('li').each(function(){
                    var cname = $(this).find('span').text();
                    var href = root_url + $(this).find('a').attr('href');
                    info.push({
                        fname:dat.fname,
                        cname:cname,
                        p_url:href
                    })
                });
            });
            db.saveData(info,'maoyan_Info');
        });
        setTimeout(function(){
            currencyCount--;
            callback(null,dat.curl)
        },1000)
    },function(err,result){
        console.log('已完成' + result.length +'条影片信息处理')
    })
})

//处理价格信息
var getPrice = function(){
    db.getAllLists("maoyan_Info",function(err,result){
        var i = 0;
        async.mapLimit(result,2,function(data,callback){
            console.log(data.p_url);
            getAjaxData(data.p_url,'.showtime-list','.showtime-list',function (result) {
                var $ = cheerio.load(result);
                if($('.stl-no').length){
                    console.log('time out!');
                    return;
                }
                $('tr').each(function(){
                    var ftime = $(this).find('.stl-time-wrap').text();
                    console.log('【'+(++i)+'】'+ftime);
                })
                console.log('i am here');
            });
            setTimeout(function(){
                callback(null,data.p_url);
            },2500);
        },function(err,result){
            console.log('已完成' + result.length +'条上映场次信息处理');
        })
    })
}

getPrice();
 */
