var express = require('express');
var router = express.Router();
var request = require('request');
var async   = require('async');
var cheerio = require('cheerio');

router.get('/', function(req, res) {
  res.send('Choose what resource you want to scrape, /diftv or /highlights');
});

router.get('/diftv', function(req, res) {
    var db = req.db;
    var collection = db.get('diftv');
    var list = [];
    var json = [];

    var url = 'http://www.difhockey.se/artiklar/0/';

    request(url, function (error, response, html){
        if (error) throw error;

        var $ = cheerio.load(html);
        var title, url;

        $('table.esNewsArchive').filter(function(){
            var data = $(this);
            var items = data.children();

            $(items).each(function (i, item) {
                var link = $(item).find($('.esNewsArchiveHeader a'));
                title = link.text();

                if (title.indexOf("DIFTV") > -1 && title.indexOf("Highlights" === -1)) {
                    url = link.attr('href');
                    list.push({
                        "title" : title,
                        "url" : "http://difhockey.se" + url
                    });
                }
            });
        })

        async.forEach(list, function (video, callback) {
            request(video.url, function (error, response, html){
                if (error) throw error;

                var $ = cheerio.load(html);
                var url = $('.esContent iframe').first().attr('src');
                json.push({
                    "title" : video.title,
                    "url" : url,
                    "last_updated" : Date.now()
                });
                callback();
            });
        }, function (err) {
            if (err) return next(err);

            if (json.length < 1) {
                res.redirect("/diftv");
            }
            collection.drop();
            collection.insert(json, function (err, doc) {
                if (err) {
                    res.send("There was a problem saving the information to the database.");
                }
                else {
                    res.redirect("/diftv");
                }
            });


        });
    })

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

        if (json.length < 1) {
            res.redirect("/highlights");
        }
        collection.drop();
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