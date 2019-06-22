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
      if ($('#new_room_name').val() == '') {
        $('#new_room_form_error').html('Please enter a room name');
      } else {
      socket.emit('new room', $('#new_room_name').val());
      }
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
      // $('#room_name').html(room);
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
      $('#header_room_name').html(user.room);
      $('#room_name_div').removeClass('hidden');
      $('#users_connected').html('1');
      $('#users_connected_div').removeClass('hidden');
      $('#user_name').html(username);
      $('#user_name_div').removeClass('hidden');
      $('#room_users_info').removeClass('hidden');
      showChoices++;
      if(showChoices >= 2) {
        $('#input_buttons_container').removeClass('hidden');
        can_make_choice = true;
        // showChoices = 0;
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
        $('#users_connected').html('2');
        $('#opponent_name').html(opponent.username);
        $('#opponent_name_div').removeClass('hidden');
        setTimeout(() => {
          $('#game_message').html('Game on !!');
          $('#user_choice>p').html('Please make your choice');
          $('#competition_choice_container .choices p').html('Thinking');
          showChoices++;
          console.log(showChoices);
          if(showChoices >= 2) {
            $('#input_buttons_container').removeClass('hidden');
            $('#input_buttons_container i').removeClass('choosen');
            $('#input_buttons_container i').removeClass('disabled');
            can_make_choice = true;
            // showChoices = 0;
          }
        }, 2000);
      } else if(Object.keys(opponent).length > 0) {
        $('#competition_choice_heading span').html('Opponent');
          $('#competition_choice_container .choices p').html('Connecting');
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
      $('#competition_choice_container .choices p').html('Made a choice');
      $('#game_message').html('Decide quick!!');
    })

    // Get result
    socket.on('result', function(res) {
      console.log(res);
      var choice_list = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
      var i = choice_list.indexOf(res[1]);
      $('#competition_choice_container .choices p').addClass('hidden');
      $($('#competition_choice_container .choices span')[i]).removeClass('hidden');
      if (res[0] == 'win') {
        $('#game_message').html('Hurray you won :D<br><button id="play_again" class="btn btn-outline-primary">Go again!</button>');
      } else if (res[0] == 'loss'){
        $('#game_message').html('You lose.. Try again!<br><button id="play_again" class="btn btn-outline-primary">Go again!</button>');
      } else {
        $('#game_message').html('It was a tie.. Try again!<br><button id="play_again" class="btn btn-outline-primary">Go again!</button>');
      }
    })

    // Leave room
    $('#leave_room').click(function() {
      socket.emit('leave');
      window.location.reload();
    })

    // opponent leave
    socket.on('opponent leave', function() {
      $('#users_connected').html('1');
      $('#opponent_name').html('');
      $('#opponent_name_div').addClass('hidden');
      $('#competition_choice_heading span').html('Opponent');
      $('#competition_choice_heading small').html('');
      $('#competition_choice_container .choices span').addClass('hidden');
      $('#competition_choice_container .choices p').html('Left the room');
      $('#competition_choice_container .choices p').removeClass('hidden');
      $('#game_message').html('Invite new friend to join the room');
      $('#user_choice p').html('No opponent');
      $('#user_choice p').removeClass('hidden');
      $('#user_choice span').addClass('hidden');
      $('#input_buttons_container').addClass('hidden');
      showChoices--;
    })

    // Play again
    $('#game_message').on('click',$('#play_again'), function(e) {
      $('#game_message').html('Get ready!!');
      setTimeout(() => {
        $('#game_message').html('Game on !!');
        $('#user_choice>p').html('Please make your choice');
        $('#user_choice>p').removeClass('hidden');
        $('#user_choice>span').addClass('hidden');
        $('#competition_choice_container .choices p').html('Thinking');
        $('#competition_choice_container .choices p').removeClass('hidden');
        $('#competition_choice_container .choices span').addClass('hidden');
        $('#input_buttons_container i').removeClass('disabled');
        $('#input_buttons_container i').removeClass('choosen');
        can_make_choice = true;
      }, 1000);
    })

    window.onbeforeunload = function(e) {
      e.preventDefault();
      e.returnValue = 'You will lose all your progress';
    }

  });

  

  // Helper functions
  

  // End of Helper functions
}

