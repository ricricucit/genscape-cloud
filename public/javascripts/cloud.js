var Cloud = (function(Utils, Drawer) {

  //expose a global socket for client (this app)
  var socket = io.connect('https://niagaraniagara.noip.me:3000');
  var data = {};


  var audioContext    = new AudioContext();
  var realAudioInput  = null,
      analyserNode    = null;


  //connect to socket
  var user_id         = Utils.userIDgenerator();
  data                = {'user_id': user_id};

  var peer = new Peer('mobile_'+user_id, {host: '85.179.64.157', secure: true, port: 3002, path: '/rt', debug: 3});

  socket.emit('cloud-connect', data);

  // peer.on('connection', function(conn) {
  //   conn.on('data', function(data){
  //     // Will print 'hi!'
  //     console.log(data);
  //   });
  // });


  peer.on('call', function(call) {
    alert('WIIIII');
    // Answer the call, providing our mediaStream
    call.answer();

    call.on('stream', function(remoteStream){
      // Show stream in some video/canvas element.
      console.log('Stream HERE!',remoteStream);

      // The Following structure creates this graph:
      // realAudioInput --> analyserNode --> audioProcessor

      //analyserNode.connect(audioContext.destination);

      setTimeout(function(ev){


        var audio_elem = document.createElement("audio");
        audio_elem.src = URL.createObjectURL(remoteStream);
        //audio_elem.play();

        realAudioInput  = audioContext.createMediaStreamSource(remoteStream);
        analyserNode = audioContext.createAnalyser();
        realAudioInput.connect(analyserNode);
        analyserNode.fftSize = 2048;

        draw(analyserNode);
      }, 2000);



    });

  });

  var draw = function(analyserNode){
    console.log("start drawing!");

    var analyserCanvas = document.getElementById("analyserHTMLcanvasLive");

    var canvas =  {
                    "el"      : analyserCanvas,
                    "context" : analyserCanvas.getContext('2d'),
                    "width"   : analyserCanvas.width,
                    "height"  : analyserCanvas.height
                  };
                  console.log(canvas);

    Drawer.drawFrequenciesCanvas(analyserNode, canvas);
  }

  document.getElementById("output").innerHTML = "test";


/*
  socket.on('changeBkgColor', function(data){
    document.body.style.background = 'green';
  });

  socket.on('stop-drawings', function(data){
    stopDrawings();
  });

   socket.on('audio-received', function(data){
    console.log("Audio received!", data);
  });

  socket.on('change-color', function(data){
    Drawer.changeColor();
  });

  var clickRedBtn = function(){
    socket.emit('clicked-red-button-live', data);
  }


  var stopDrawings = function(){
    Drawer.stopDrawings();
  }
*/


  //expose public vars and/or function
  return {
  };


})(Utils, Drawer);