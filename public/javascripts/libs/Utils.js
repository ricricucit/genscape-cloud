var Utils = (function(){

  var userIDgenerator = function(){
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1) + '-' + (((1+Math.random())*0x10000)|0).toString(16).substring(1) + '-' + (((1+Math.random())*0x10000)|0).toString(16).substring(1) + '-' + (((1+Math.random())*0x10000)|0).toString(16).substring(1) + '-'+ (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  //expose public vars and/or function
  return {
    userIDgenerator       : userIDgenerator
  };

})();