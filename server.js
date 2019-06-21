var app = require('express')(); // importing express framework
var http = require('http').createServer(app); // importing http class
var io = require('socket.io')(http); // importing socket.io library
var express = require('express');

var rooms = {};
var users = {};
var choices = {};

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
      // socket_user = {
      //   [sid]: users[sid]
      // }
      socket.to(name).emit('user connected', users[sid]);
      var opponents = roomOpponents(name, sid);
      socket.emit('user connected', opponents);
    }
  });

  // Getting username from socket
  socket.on('username', function(username) {
    sid = socket.id;
    users[sid].username = username;
    consoleLog();
    // socket_user = {
    //   [sid]: users[sid]
    // }
    socket.to(users[sid].room).emit('user connected', users[sid]);
    var opponents = roomOpponents(users[sid].room, sid);
    socket.emit('user connected', opponents);
  })

  // on choices sent
  socket.on('choice', function(choice){
    sid = socket.id;
    room = users[sid].room;
    if (choices[room]) {
      choices[room].choices_num += 1;
    } else {
      choices[room] = {};
      choices[room].choices_num = 1;
      socket.to(room).emit('opponent input');
    }
    choices[room][sid] = choice;
    // console.log(choices);
    socket.to(room).emit('opponent choice');
    if (choices[room].choices_num >= 2) {
      result = checkWinner(room);
      players = roomUsers(room);
      room_choices = [
        choices[room][players[0]],
        choices[room][players[1]]
      ]
      if (result == 2) {
        io.to(room).emit('result', 'tie');
      } else if (result == 1) {
        io.to(players[0]).emit('result', ['win', room_choices[1]]);
        io.to(players[1]).emit('result', ['loss', room_choices[0]]);
      } else {
        io.to(players[0]).emit('result', ['loss', room_choices[1]]);
        io.to(players[1]).emit('result', ['win', room_choices[0]]);
      }
      delete choices[room];
    }
  })

  // leave room
  socket.on('leave', function() {
    sid = socket.id;
    room = users[sid].room;
    socket.leave(room);
    socket.to(room).emit('opponent leave');
  })

});


// Helper functions
function consoleLog() {
  console.log('users:')
  console.log(users);
  console.log('rooms:');
  console.log(rooms);
  console.log('choices');
  console.log(choices);
};

function roomUsers(room) {
  var roomUsers = [];
  for (var user in users) {
    if (users[user].room == room) {
      roomUsers.push(users[user].sid);
    }
  }
  return roomUsers;
}

function roomOpponents(room, sid) {
  var roomOpponents = {};
  for (var user in users) {
    if (users[user].room == room && users[user].sid != sid) {
      // console.log(users[user].sid);
      roomOpponents = users[user];
    }
  }
  return roomOpponents;
}

function checkWinner(room) {
  players = roomUsers(room);
  choice_inputs = [
    choices[room][players[0]],
    choices[room][players[1]]
  ];

  if (choice_inputs[0] == choice_inputs[1]) {
    return 2;
  }
  
  switch (choice_inputs.join(' ')) {
    case 'rock paper':
      return 0;
      break;
    case 'paper rock':
      return 1;
      break;
      
    case 'rock scissors':
      return 1;
      break;
    case 'scissors rock':
      return 0;
      break;
      
    case 'rock lizard':
      return 1;
      break;
    case 'lizard rock':
      return 0;
      break;
      
    case 'rock spock':
      return 0;
      break;
    case 'spock rock':
      return 1;
      break;
      
    case 'paper scissors':
      return 0;
      break;
    case 'scissors paper':
      return 1;
      break;
      
    case 'paper lizard':
      return 0;
      break;
    case 'lizard paper':
      return 1;
      break;
      
    case 'paper spock':
      return 1;
      break;
    case 'spock paper':
      return 0;
      break;
      
    case 'scissors lizard':
      return 1;
      break;
    case 'lizard scissors':
      return 0;
      break;
      
    case 'scissors spock':
      return 0;
      break;
    case 'spock scissors':
      return 1;
      break;
      
    case 'lizard spock':
      return 1;
      break;
    case 'spock lizard':
      return 0;
      break;
  }

}

// End of helper functions

// listening to requests to the server by users
http.listen(process.env.PORT || 3000, function() {
  console.log('listening on *:3000');
});