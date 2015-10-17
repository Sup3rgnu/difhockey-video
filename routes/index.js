var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'DIF videos' });
});

router.get('/highlights', function(req, res) {
    var db = req.db;
    var collection = db.get('highlights');
    collection.find({},{},function(e,docs){
        res.render('highlights', {
            "videos" : docs
        });
    });
});

router.get('/diftv', function(req, res) {
    var db = req.db;
    var collection = db.get('diftv');
    collection.find({},{},function(e,docs){
        res.render('diftv', {
            "videos" : docs
        });
    });
});

module.exports = router;
