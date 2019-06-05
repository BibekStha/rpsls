var app = require('express')(); // importing express framework
var http = require('http').createServer(app); // importing http class
var io = require('socket.io')(http); // importing socket.io library
var express = require('express');

// serving static files
// ************* very important to include this line to make static files work **********
app.use('/public', express.static(__dirname + '/public'));

// routing
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// socket.io logic
// on connection from the user
io.on('connection', function(socket) {
  console.log('user connected');

  // when user send's a chat message
  socket.on('chat message', function(msg) {
    console.log('message: ' + msg)
  })

  // on disconnection by the user
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});


// listening to requests to the server by users
http.listen(3000, function() {
  console.log('listening on *:3000');
});