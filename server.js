var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){

	url = 'http://www.difhockey.se/artiklar/0/';

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			var title, url;
			var json = { 
				videos : [], 
				highlights : [] 
			};

			$('table.esNewsArchive').filter(function(){

		        var data = $(this);
		        var items = data.children();

				$(items).each(function (i, item) {
		        	var link = $(item).find($('.esNewsArchiveHeader a'));
		        	title = link.text();

		        	if (title.indexOf("TV:") > -1) {
			        	url = link.attr('href');

			        	if (title.indexOf("Highlights") > -1) {
				        	json.highlights.push({
			        			"title" : title,
	        					"url" : "http://difhockey.se" + url
			        		});
			        	} else {
				        	json.videos.push({
			        			"title" : title,
	        					"url" : "http://difhockey.se" + url
			        		});
			        	}

		        	}
				});

				///console.log(json);
	        })
		}

		fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        	console.log('File successfully written! - Check your project directory for the output.json file');
        })

        res.send('Check your console!')
	})
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;