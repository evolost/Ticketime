var Nightmare = require('nightmare');
var nightmare = Nightmare({
    show: true,
    //webPreferences: {
    //    preload: '/jquery.js'
    //}
})
//选取影院
//nightmare
//    .useragent('Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36')
//    .goto('http://m.gewara.com/movie/m/choiceCinema.xhtml?mid=241693093')
//    .wait(800)
//    .scrollTo(1000, 0)
//    .wait(1500)
//    .scrollTo(2000,0)
//    .wait(1500)
//    .scrollTo(3000,0)
//    .wait(1500)
//    .scrollTo(4000,0)
//    .wait(1500)
//    .scrollTo(5000,0)
//    .wait(1500)
//    .scrollTo(6000,0)
//    .wait(1500)
//    .scrollTo(7000,0)
//    .wait(1500)
//    .evaluate(function () {
//        return document.querySelector('#loadCinema').innerHTML;
//        //return $('#loadCinema').html();
//        //return !!window.jQuery;
//    })
//    .end()
//    .then(function(content){
//        console.log(content);
//        //callback(content)
//    })

//获取影片
nightmare
    .useragent('Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36')
    .goto('http://m.gewara.com')
    .wait(800)
    .click('#pullUpHot')
    .wait(1500)
    .click('#pullUpHot')
    .wait(1500)
    .click('#pullUpHot')
    .wait(1500)
    .click('#pullUpHot')
    .wait(1500)
    .evaluate(function () {
        return document.querySelector('#hotlist').innerHTML;
        //return $('#loadCinema').html();
        //return !!window.jQuery;
    })
    .end()
    .then(function(content){
        console.log(content);
        //callback(content)
    })
