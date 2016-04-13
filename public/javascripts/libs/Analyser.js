var Analyser = (function(){

  var audioContext    = new AudioContext();
  var realAudioInput  = null,
      analyserNode    = null;
  var analyserCanvasContext = null;
  var audioStream;
  var audioProcessor  = null;


  var audioInputSelect, audioOutputSelect, videoSelect, videoElement, AVselectores;


  var captureStream = function(AVselectors, videoElement){

    audioInputSelect    = AVselectors[0];
    audioOutputSelect   = AVselectors[1];
    videoSelect         = AVselectors[2];
    videoElement        = videoElement;
    AVselectores         = AVselectors;

    console.log("AVselectors", AVselectors);


    navigator.getUserMedia = ( navigator.getUserMedia ||
                               navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia ||
                               navigator.msGetUserMedia);


    return new Promise(function(resolve, reject) {

      if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
          track.stop();
        });
      }
      var audioSource = audioInputSelect.value;
      var videoSource = videoSelect.value;
      var constraints = {
        audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
        video: {deviceId: videoSource ? {exact: videoSource} : undefined},
        video: false
      };
      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {
        window.stream = stream; // make stream available to console
        resolve(stream);
        videoElement.srcObject = stream;
        // Refresh button list in case labels have become available
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(gotDevices)
      .catch(errorCallback);

    });

  }


  var stopAudioCapture = function(){
    console.log("STOPPING STREAM: ", audioStream);
    audioStream.getTracks()[0].stop();
    //audioProcessor.disconnect(audioContext.destination);
  }

  var gotDevices = function(deviceInfos) {
    console.log('got devices!', deviceInfos, AVselectores);
    // Handles being called several times to update labels. Preserve values.
    var values = AVselectores.map(function(select) {
      return select.value;
    });
    AVselectores.forEach(function(select) {
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
    });
    for (var i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      var option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label ||
          'microphone ' + (audioInputSelect.length + 1);
        audioInputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'audiooutput') {
        option.text = deviceInfo.label || 'speaker ' +
            (audioOutputSelect.length + 1);
        audioOutputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
        videoSelect.appendChild(option);
      } else {
        console.log('Some other kind of source/device: ', deviceInfo);
      }
    }
    AVselectores.forEach(function(select, selectorIndex) {
      if (Array.prototype.slice.call(select.childNodes).some(function(n) {
        return n.value === values[selectorIndex];
      })) {
        select.value = values[selectorIndex];
      }
    });
  }

  var errorCallback = function(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  // Attach audio output device to video element using device/sink ID.
  var attachSinkId = function(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
      element.setSinkId(sinkId)
      .then(function() {
        console.log('Success, audio output device attached: ' + sinkId);
      })
      .catch(function(error) {
        var errorMessage = error;
        if (error.name === 'SecurityError') {
          errorMessage = 'You need to use HTTPS for selecting audio output ' +
              'device: ' + error;
        }
        console.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        audioOutputSelect.selectedIndex = 0;
      });
    } else {
      console.warn('Browser does not support output device selection.');
    }
  }

  var changeAudioDestination = function() {
    var audioDestination = audioOutputSelect.value;
    attachSinkId(videoElement, audioDestination);
  }

  var start = function() {
    if (window.stream) {
      window.stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    var audioSource = audioInputSelect.value;
    var videoSource = videoSelect.value;
    var constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
      window.stream = stream; // make stream available to console
      videoElement.srcObject = stream;
      // Refresh button list in case labels have become available
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch(errorCallback);
  }

  //expose public vars and/or function
  return {
    captureStream          : captureStream,
    stopAudioCapture      : stopAudioCapture,
    analyserNode          : analyserNode,
    start                 : start
  };

})();