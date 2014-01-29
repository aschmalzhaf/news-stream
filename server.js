
var elements = require(__dirname+'/dummy_elements.js');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var util = require("util");
//app.use(express.logger());

app.use(express.bodyParser({uploadDir:'./static/uploads'}));


server.listen(80);


//socket for pushing notification when new pic is available
io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('newPicture', function (data) {
		console.log("------- New Broadcast");
		socket.broadcast.emit('newPicture');
	});
});



app.post("/api/upload", function(req, res, next){

//SRC: http://www.hacksparrow.com/handle-file-uploads-in-express-node-js.html
/*
    // get the temporary location of the file
    var tmp_path = req.files.myFile.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './public/images/' + req.files.thumbnail.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
        });
    });
*/
	
	
	var n = req.files.myFile.path.lastIndexOf('\\');
	console.log('Last Pos: ' + req.files.myFile.path.substring(n + 1));

	
	io.sockets.emit('newPicture', {"filename":req.files.myFile.path.substring(n + 1)});


	res.send('File uploaded: ' + req.files.myFile.path);

})



app.get("/api/elements", function(req, res, next){
	res.send(elements.getElements());
})


app.use(function(req, res, next){
	console.log('%s %s', req.method, req.url);
	next();
});







app.use(express.static(__dirname + '/static'));

//app.listen(80);


/*
Possible Data Structure

pictures
	id
	url
	createdAt
	createdBy

users
	id
	mailadress
	name
	password
	role
	createdAt
	createdBy


Ressources:
http://nodejsdb.org/


	*/