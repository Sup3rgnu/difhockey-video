Scrapes videos from DIF hockey

1. npm install
2. mongod --dbpath /data
3. npm start
4. http://localhost:3000/

## Routes ##
/highlights
/diftv

/scraper/highlights
/scraper/diftv



## Issues ##

Problems running mongo on heroku: 

$ npm install node-gyp -g && npm cache clean && rm -rf node_modules && npm install