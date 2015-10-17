var express = require('express');
var fs 		= require('fs');
var request = require('request');
var async 	= require('async');
var cheerio = require('cheerio');
var app 	= express();

app.get('/shl', function (req, res){
	url = 'http://play.shl.se/search/%20dif%20highlights';

	request(url, function (error, response, html){
		if (error) throw error;

		var json = { 
			images : []
		};

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
				json.images.push({
					"id" : id,
					"token" : token,
					"title" : title
				});
			});
		
			fs.writeFile('output.shl.json', JSON.stringify(json, null, 4), function (err, data){
				if (err) throw err;
				console.log('File successfully written! - Check your project directory for the output.json file');
			})

		res.send('done');
	})
});

app.get('/dif', function (req, res){

	url = 'http://www.difhockey.se/artiklar/0/';

	request(url, function (error, response, html){
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
			        		// pushing to same list at the moment
				        	json.videos.push({
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
			})
		}

		fs.writeFile('output.dif.json', JSON.stringify(json, null, 4), function (err, data){
			if (err) throw err;

			console.log('File successfully written! - Check your project directory for the output.json file');
		})

		res.send('Check your console!')
	})
});

app.get('/shlVideos', function (req, res){

	fs.readFile('output.shl.json', 'utf8', function (err, data) {
		if (err) throw err;
		var json = JSON.parse(data);
		var list = json.images;

		var htmlStart = '<html><head><style>div{display:block;float:left;width:24%;}iframe{width:100%;height:200px}h4{height:50px}</style></head><body>';
		var htmlEnd = '</body></html>';
		var videoFrames = '';
		var videoTitles = '';

		for ( var i in list) {
			videoFrames += '<div><iframe src="http://video.shl.se/9921825.ihtml/player.html?token=' + list[i].token 
			+ '&amp;autoPlay=0&amp;source=embed&amp;photo%5fid=' + list[i].id + '" ></iframe>'
			+ '<h4>' + list[i].title + '</h4></div>';
		}

		res.send(htmlStart + videoFrames + htmlEnd);
	});
});

app.get('/difVideos', function (req, res){
	var videos = [];

	fs.readFile('output.dif.json', 'utf8', function (err, data) {
		if (err) throw err;
		var json = JSON.parse(data);
		var list = json.videos;

		async.forEach(list, function (video, callback) {
			request(video.url, function (error, response, html){
				if (error) throw error;

				var $ = cheerio.load(html);
				var url = $('.esContent iframe').first().attr('src');
				videos.push({ 
					"url" : url, 
					"title" : video.title
				});
				callback();
			});

		}, function (err) {
			if (err) return next(err);

//			fs.writeFile('videos.json', JSON.stringify(videos, null, 4), function (err, data){
//				if (err) throw err;
//				console.log('File successfully written! - Check your project directory for the output.json file');
//			})

			var htmlStart = '<html><head><style>div{display:block;float:left;width:24%;}iframe{width:100%;height:200px}h4{height:50px}</style></head><body>';
			var htmlEnd = '</body></html>';
			var videoFrames = '';
			var videoTitles = '';

			for ( var i in videos) {
				videoFrames += '<div><iframe src="' + videos[i].url + '"></iframe><h4>' + videos[i].title + '</h4></div>';
			}

			res.send(htmlStart + videoFrames + htmlEnd);
		});
	});
});

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
