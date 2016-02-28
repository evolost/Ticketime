var express = require('express');
var router = express.Router();
var crawler = require('../lib/crawler');
/* GET admin page. */

router.get('/', function(req, res, next) {
  res.render('admin.html', { title: 'Admin' });
  //next();
});
//获取数据
router.post('/',function(req,res,next){
	//res.send('refresh success!'); // 此处发送的data, 前端中callback里将会得到的data
	var data = req.body.page;
	/*刷新影院信息*/
    //crawler.getCinameData();

    /*刷新影片信息*/
    crawler.getFilmData(data.from || 1,data.to || 2)//刷新并保存数据
    res.redirect('/admin');
});

//处理数据(price)
router.post('/getPriceButton',function(req,res,next){
	crawler.getPrice();
	res.send('Price refresh success!');
	res.end();
});


module.exports = router;