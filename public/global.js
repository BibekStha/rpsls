window.onload = function() {
    
  $(function () {
    var socket = io();
    let user = {};
    let opponent = {};
    let showChoices = 0;
    $('#new_room_name').focus();
    var can_make_choice = false;


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
      $('#room_name').html(room);
      console.log(user);
      $('#initial_info').addClass('hidden');
      $('#prior_username_form_message').html('Game room \'' + room + '\' created successfully!');
      $('#username_form').removeClass('hidden');
      $('#username').focus();
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
      $('#username').focus();
    });

    // Enter username
    $('#username_form').submit(function(e) {
      e.preventDefault();
      var username = $('#username').val();
      console.log(username);
      socket.emit('username', username);
      user.username = username;
      $('#user_choice_heading span').html(username);
      $('#username_form').addClass('hidden');
      $('#game_info').removeClass('hidden');
      showChoices++;
      if(showChoices >= 2) {
        $('#input_buttons_container').removeClass('hidden');
        can_make_choice = true;
      }
    });

    // Other user connected
    socket.on('user connected', function(user) {
      opponent = user;
      console.log(opponent);
      if (Object.keys(opponent).length > 0 && opponent.username) {
        $('#competition_choice_heading span').html(opponent.username);
        $('#competition_choice_heading small').html('Opponent');
        $('#game_message').html('Get ready!!');
        setTimeout(() => {
          $('#game_message').html('Game on !!');
          $('#user_choice>p').html('Please make your choice');
          $('#competition_choice_container .choices').html('Thinking');
          showChoices++;
          if(showChoices >= 2) {
            $('#input_buttons_container').removeClass('hidden');
            can_make_choice = true;
          }
        }, 2000);
      } else if(Object.keys(opponent).length > 0) {
        $('#competition_choice_heading span').html('Opponent');
          $('#competition_choice_container .choices').html('Connecting');
          $('#game_message').html('Almost there');
      }
    })

    // Make choice
    $('#input_buttons_container i').click(function(e) {
      if (can_make_choice) {
        $('#input_buttons_container i').addClass('disabled');
        $(e.target).removeClass('disabled');
        $(e.target).addClass('choosen');
        var choice_list = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
        var choice_input_list = $('#input_buttons_container i');
        var r;
        for (i=0; i<choice_input_list.length; i++) {
          if (choice_input_list[i] == e.target) {
            r = i;
          }
        }
        socket.emit('choice', choice_list[r]);
        can_make_choice = false;
        $('#user_choice>p').addClass('hidden');
        $($('#user_choice span')[r]).removeClass('hidden');
      }
    })

    // Opponent chose
    socket.on('opponent input', function() {
      $('#competition_choice_container .choices').html('Made a choice');
      $('#game_message').html('Decide quick!!');
    })

    // Get result
    socket.on('result', function(res) {
      console.log(res);
    })

  });

  

  // Helper functions
  window.onbeforeunload = function(e) {
    e.preventDefault();
    e.returnValue = 'You will lose all your progress';
  }

  // End of Helper functions
}

