'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var validUrl = require('valid-url');



var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// create a schema
var Schema = mongoose.Schema;
var urlSchema = new Schema({
  longURL: String,
  shortURL: String
});

// create the model
var URL = mongoose.model('URL', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST new URL to be shortened
app.post('/api/shorturl/new', function(req, res) {
  if (validUrl.isUri(req.body.url)) {
    URL.count(function(err, count) {
      let newCount = count + 1;
      if (err) res.json({"error": err});
      let url = new URL({
        longURL: req.body.url,
        shortURL: newCount
      });
      url.save(function(err, url) {
        if (err) res.json({"error": err});
        res.json({"original_url": url.longURL,"short_url": url.shortURL});
      })
    })
  } else {
      res.json({"error":"invalid URL"});
    }
});  


// GET shortURL redirects to longURL
app.get('/api/shorturl/:shorturl', function(req, res) {
  URL.findOne({shortURL: req.params.shorturl}, function(err, url) {
    if (err) {
      res.json({"error":"invalid URL"});
    } else if (url !== null) {
      res.redirect(url.longURL);
    } else {
      res.json({"error":"invalid URL"});
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});