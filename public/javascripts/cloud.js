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

  var peer = new Peer('mobile_'+user_id, {host: 'niagaraniagara.noip.me',
                                          secure: true,
                                          port: 3002,
                                          path: '/rt',
                                          debug: 3,
                                          config: {'iceServers': [
                                                    { 'url': 'stun:stun.l.google.com:19302' },
                                                    { 'url': 'stun:stun.l.google.com:19302'  },
                                                    { 'url': 'stun:stun1.l.google.com:19302' },
                                                    { 'url': 'stun:stun2.l.google.com:19302' },
                                                    { 'url': 'stun:stun3.l.google.com:19302' },
                                                    { 'url': 'stun:stun4.l.google.com:19302' },
                                                    { 'url': 'stun:stun.ekiga.net' },
                                                    { 'url': 'stun:stun.ideasip.com' },
                                                    { 'url': 'stun:stun.rixtelecom.se' },
                                                    { 'url': 'stun:stun.schlund.de'  },
                                                    { 'url': 'stun:stun.stunprotocol.org:3478' },
                                                    { 'url': 'stun:stun.voiparound.com'  },
                                                    { 'url': 'stun:stun.voipbuster.com'  },
                                                    { 'url': 'stun:stun.voipstunt.com' },
                                                    { 'url': 'stun:stun.voxgratia.org' },
                                                    {
                                                      url: 'turn:numb.viagenie.ca',
                                                      credential: 'muazkh',
                                                      username: 'webrtc@live.com'
                                                    },
                                                    {
                                                      url: 'turn:192.158.29.39:3478?transport=udp',
                                                      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                                                      username: '28224511:1379330808'
                                                    },
                                                    {
                                                      url: 'turn:192.158.29.39:3478?transport=tcp',
                                                      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                                                      username: '28224511:1379330808'
                                                    }
                                                  ]}
                                        });

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