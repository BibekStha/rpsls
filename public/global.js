window.onload = function() {
    
  $(function () {
    var socket = io();
    let user = {}

    // Emit user is ready to play
    $('#ready_btn').click(function() {
      socket.emit('player ready', );
    });

    // Emit chat message
    // $('form').submit(function(e){
    //   e.preventDefault(); // prevents page reloading
    //   socket.emit('chat message', $('#m').val());
    //   $('#m').val('');
    //   return false;
    // });


  });

}
