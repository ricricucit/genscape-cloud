var Client = (function(Utils, Drawer) {

  //expose a global socket for client (this app)
  var cloud_socket = io();
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
                                                      credential: 'Ricucit2.',
                                                      username: 'enrico.icardi@gmail.com'
                                                    }
                                                  ]}
                                        });

  cloud_socket.emit('client-connect', data);

  // peer.on('connection', function(conn) {
  //   conn.on('data', function(data){
  //     // Will print 'hi!'
  //     console.log(data);
  //   });
  // });

  peer.on('call', function(call) {
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


  //expose public vars and/or function
  return {
  };


})(Utils, Drawer);