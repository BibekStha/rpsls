var app = require('express')(); // importing express framework
var http = require('http').createServer(app); // importing http class
var io = require('socket.io')(http); // importing socket.io library
var express = require('express');

var rooms = {};
var users = {};

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
  sid = socket.id;
  console.log('user connected: ' + sid);

  users[sid] = {};
  consoleLog();

  // when user send's a chat message
  // socket.on('chat message', function(msg) {
  //   console.log('message: ' + msg)
  // })

  // on disconnection by the user
  socket.on('disconnect', function() {
    sid = socket.id;
    console.log('user disconnected: ' + sid);
    if(users[sid].room) {
      socket_room = users[sid].room;
      rooms[socket_room] -= 1;
      if (rooms[socket_room] < 1) {
        delete rooms[socket_room];
      }
    }
    delete users[sid];
    consoleLog();
  });

  // new game room
  socket.on('new room', function(name) {
    sid = socket.id;
    console.log(name);
    console.log(socket.id);
    if(rooms[name]) {
      console.log('room exists');
      socket.emit('room create failed', 'The room name already exists!<br>Please provide a new name')
      consoleLog();
    } else {
      socket.join(name);
      // console.log(socket.adapter.rooms[name]);
      rooms[name] = 1;
      console.log('room created: ' + name);
      users[sid] = {
        sid: sid,
        room: name
      };
      consoleLog();
      socket.emit('room created', name);
    }

    // console.log(socket.handshake);
  });

  // Joining a room
  socket.on('join room', function(name) {
    sid = socket.id
    console.log(name);
    console.log(socket.id);
    console.log(rooms[name]);
    if(!rooms[name]) {
      console.log('room doesn\'t exist');
      socket.emit('room join failed', 'The room doesn\'t exist!<br>Please check with the creater of the room');
      consoleLog();
    }else if(rooms[name] >= 2){
      console.log('Room is already full');
      socket.emit('room full', 'The room is already full');
      consoleLog();
    } else {
      socket.join(name);
      rooms[name] += 1;
      users[sid] = {
        sid: sid,
        room: name
      };
      consoleLog();
      socket.emit('room joined', name);
      socket.to(name).emit('user connected', users[sid]);
    }
  });

  // Getting username from socket
  socket.on('username', function(username) {
    sid = socket.id;
    users[sid].username = username;
    consoleLog();
    socket.to(users[sid].room).emit('user connected', users[sid]);
  })

  // on player ready
  socket.on('player ready', function(){
    
  })
});


// Helper functions
function consoleLog() {
  console.log('users:')
  console.log(users);
  console.log('rooms:');
  console.log(rooms);
};

function roomUsers(room) {
  var roomUsers = [];
  for (var user in users) {
    if (users[user].room == room) {
      roomUsers.push(user);
    }
  }
  return roomUsers;
}

// End of helper functions

// listening to requests to the server by users
http.listen(process.env.PORT || 3000, function() {
  console.log('listening on *:3000');
});