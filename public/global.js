window.onload = function() {
    
  $(function () {
    var socket = io();
    let user = {};
    let opponents = {};


    // New game room request
    $('#new_room_form').submit(function(e) {
      e.preventDefault();
      console.log($('#new_room_name').val());
      socket.emit('new room', $('#new_room_name').val());
      // $('#new_room_name').val('');
    });

    // Game room create failed
    socket.on('room create failed', function(msg) {
      $('#new_room_form_error').html(msg);
    });

    // New game room created
    socket.on('room created', function(room) {
      console.log('Game room created: ' + room);
      $('#new_room_form_error').html('New room created');
      user.room = room;
      console.log(user);
      $('#initial_info').addClass('hidden');
      $('#prior_username_form_message').html('Game room \'' + room + '\' created successfully!');
      $('#username_form').removeClass('hidden');
    });

    // Joining an existing game room
    $('#existing_room_form').submit(function(e) {
      e.preventDefault();
      console.log($('#existing_room_name').val());
      socket.emit('join room', $('#existing_room_name').val());
      // $('#existing_room_name').val('');
    });

    // Game room joining failed
    socket.on('room join failed', function(msg) {
      $('#existing_room_form_error').html(msg);
    });

    // Room full
    socket.on('room full', function(msg) {
      $('#existing_room_form_error').html(msg);
    });

    // Game room joined
    socket.on('room joined', function(room) {
      console.log('Game room joined: ' + room);
      $('#existing_room_form_error').html('Room joined');
      user.room = room;
      console.log(user);
      $('#initial_info').addClass('hidden');
      $('#prior_username_form_message').html('Game room \'' + room + '\' joined successfully!');
      $('#username_form').removeClass('hidden');
    });

    // Enter username
    $('#username_form').submit(function(e) {
      e.preventDefault();
      var username = $('#username').val();
      console.log(username);
      socket.emit('username', username);
      user.username = username;
      $('#username_form').addClass('hidden');
      $('#game_info').removeClass('hidden');
    });

    // Other user connected
    socket.on('user connected', function(user) {
      opponents[user.sid] = user;
      console.log(opponents);
    })

    // Emit user is ready to play
    // $('#ready_btn').click(function() {
    //   socket.emit('player ready', );
    // });

    // Emit chat message
    // $('form').submit(function(e){
    //   e.preventDefault(); // prevents page reloading
    //   socket.emit('chat message', $('#m').val());
    //   $('#m').val('');
    //   return false;
    // });


  });


  window.onbeforeunload = function(e) {
    e.preventDefault();
    e.returnValue = 'You will lose all your progress';
    // return 'You will lose all your progress';
  }

}

