=======================
DIFHockey-video
========================

Scrapes videos from DIF hockey


Setup
------------

### Setup 

```bash
$ npm install
``` 

```bash
$ mongod --dbpath /data
``` 

```bash
$ npm start
``` 

http://localhost:3000/


### Routes

/highlights
/diftv

/scraper/highlights
/scraper/diftv


### Errors 

Problems running mongo on heroku: 

```bash
$ npm install node-gyp -g && npm cache clean && rm -rf node_modules && npm install
``` 
