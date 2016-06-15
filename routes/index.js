var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('test', {});
});

router.get('/test1',function(req,res,next){
	res.render('test1',{});
})

router.get('/test2',function(req,res,next){
	res.render('test2',{});
})
router.get('/mes',function(req,res,next){
	res.render('message',{});
})


module.exports = router;
