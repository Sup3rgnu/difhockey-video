var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

router.get('/', function(req, res) {
  res.send('Choose what resource you want to scrape, /diftv or /highlights');
});

router.get('/diftv', function(req, res) {
    var db = req.db;
    var collection = db.get('diftv');


    res.redirect("/diftv");
});

router.get('/highlights', function(req, res) {
    var db = req.db;
    var collection = db.get('highlights');
    var json = [];

    var url = 'http://play.shl.se/search/%20dif%20highlights';

    request(url, function (error, response, html){
        if (error) throw error;

        var id, token, title;

        var $ = cheerio.load(html);

            var items = $('.footerVideoListWrapper .footerThumbDiv');

            $(items).each(function (i, item){
                var image = $(item).find('.thumbImage').attr('src');
                var desc = $(item).find('.videodesc');
                title = $(desc[1]).text();

                var temp = image.split('/');
                id = temp[4];
                token = temp[5];

                json.push({
                    "id" : id,
                    "token" : token,
                    "title" : title,
                    "last_updated" : Date.now()
                });
            });

            collection.insert(json, function (err, doc) {
                if (err) {
                    res.send("There was a problem saving the information to the database.");
                }
                else {
                    res.redirect("/highlights");
                }
            });
    })
});

module.exports = router;