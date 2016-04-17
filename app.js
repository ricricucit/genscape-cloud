// middleware to isolate some funcs
var middleware = require("./middleware.js");

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app_cloud = express();


// uncomment after placing your favicon in /public
//app_cloud.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app_cloud.use(logger('dev'));
app_cloud.use(bodyParser.json());
app_cloud.use(bodyParser.urlencoded({ extended: false }));
app_cloud.use(cookieParser());
app_cloud.use(express.static(path.join(__dirname, 'public')));

app_cloud.use(express.static(__dirname + '/public'));
app_cloud.use(express.static(__dirname + '/node_modules'));



var config = require("./config.json");
// Require file module
const fs = require('fs');
// set HTTPS createServer
var privateKey = fs.readFileSync( config.ssl_private_key );
var certificate = fs.readFileSync( config.ssl_certificate );

// create needed servers
var https_cloud = require('https').createServer( {
                                            key: privateKey,
                                            cert: certificate
                                        }, app_cloud);
var https_stream_cloud = require('https').createServer( {
                                            key: privateKey,
                                            cert: certificate
                                        }, app_cloud);


var ExpressPeerServer = require('peer').ExpressPeerServer;

var io_cloud = require('socket.io')(https_cloud);






//start express LIVE (for streaming)
https_stream_cloud.listen(3002, function(){
  console.log('CLOUD listening STREAM events CloudServer:3002');
}).on('error', function(err) {
  console.log('\n------------------------------------\nNetworking ERROR.\nCannot listen to: 3002 on CloudServer\nPlease check your Network settings\n------------------------------------\n');
  process.exit();
});

app_cloud.use('/rt', ExpressPeerServer(https_stream_cloud, {debug: 3}));

//start express LIVE
https_cloud.listen(3000, function(){
  console.log('CLOUD listening events on heroku?:3000');
}).on('error', function(err) {
  console.log('\n------------------------------------\nNetworking ERROR.\nCannot listen to: cloud:3000\nPlease check your Network settings\n------------------------------------\n');
  process.exit();
});



//on connection creation, a socket is created
io_cloud.on('connection', function(socket){

  console.log('\n✆ Cloud connected, ID: ', socket.client.id);


  socket.on('disconnect', function(){

    console.log('user, #' + socket.client.id + ' disconnected from CLOUD');

    middleware.removeClient(socket.client.id);

    if(!middleware.stageIsConnected()){
      console.error('\n☹ STAGE is not present.')
    }
  });

  //live connection
  socket.on('cloud-connect', function(data){
    middleware.addClient(socket.client.id, "cloud", data);
    var liveObj = middleware.getLiveObj()
    socket.broadcast.emit("cloud-joined", liveObj);
  });

  //live connection
  socket.on('client-connect', function(data){
    middleware.addClient(socket.client.id, data.user_id, data);
    //var liveObj = middleware.getLiveObj();
    socket.broadcast.emit("client-joined", data);
  });

});























app_cloud.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app_cloud.get('/client', function(req, res){
  res.sendFile(__dirname + '/views/client.html');
});




// catch 404 and forward to error handler
app_cloud.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app_cloud.get('env') === 'development') {
  app_cloud.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app_cloud.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app_cloud;
