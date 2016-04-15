// middleware.js
(function() {

  var liveObj = {
                  "users" : [],
                  "controller" : {"key1": 1, "key2": 0, "key3": 1}
                }

  var connectedIds = [];

  function getLiveObj() {
    /*console.log(liveObj);*/
    return liveObj;
  }

  function addClient(clientId, type, extras) {

    //default func params
    type    = type || "unknown-device";
    extras  = extras || false;

    if(type === 'stage' && stageIsConnected()){
      console.log('!!! No more than 1 stages are allowed');
      showClientsList();
      return;
    }

    if(connectedIds.pushUnique(clientId)){

      liveObj.users.push( {"id" : clientId, "user_id" : extras.user_id, "type" : type, "extras" : extras} );

      showClientsList();

    }

  }

  function removeClient(clientId) {

    for (var i = 0, len = liveObj.users.length; i < len; i++) {

      if(liveObj.users[i].id === clientId){

        liveObj.users.splice(i, 1);

        showClientsList();

        break;// breaks loop after delete
      };

    }

  }

  function showClientsList(){

    console.log("- - - - - - - - - - - -");
    console.log("Total users connected: ", liveObj.users.length);

    for (var i = 0, len = liveObj.users.length; i < len; i++) {

      console.log(i + ') ' + liveObj.users[i].type + ": ", liveObj.users[i].user_id + ' (' + liveObj.users[i].id + ')');

    }

    console.log("- - - - - - - - - - - -");
  }

  function stageIsConnected(){

    for (var i = 0, len = liveObj.users.length; i < len; i++) {

      if(liveObj.users[i].type === 'stage'){
        return true;
      }

    }

  }

  function modifyAudioObject(data){

    console.log('-----audio----', data);
    liveObj.audio_stream.push(data);
    return liveObj;
  }

  module.exports.getLiveObj           = getLiveObj;
  module.exports.addClient            = addClient;
  module.exports.removeClient         = removeClient;
  module.exports.stageIsConnected     = stageIsConnected;
  module.exports.modifyAudioObject    = modifyAudioObject;

})();



Array.prototype.pushUnique = function (item){
    if(this.indexOf(item) == -1) {
    //if(jQuery.inArray(item, this) == -1) {
        this.push(item);
        return true;
    }
    return false;
}