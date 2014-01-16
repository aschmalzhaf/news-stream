var express = require('express');
var elements = require(__dirname+'/dummy_elements.js');
var app = express();

//app.use(express.logger());


app.post("/api/upload", function(req, res, next){
	console.log("File is here");
})


app.get("/api/elements", function(req, res, next){
	console.log(elements.getElements());
	res.send(elements.getElements());
})


app.use(function(req, res, next){
	console.log('%s %s', req.method, req.url);
  	next();
});




app.use(express.static(__dirname + '/static'));

app.listen(80);