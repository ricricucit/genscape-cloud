// middleware to isolate some funcs
var middleware = require("./middleware.js");

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app         = express();
var app_socket  = express();

var regular_port = 9000;


//config static files routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));


//read configuration file
var config = require("./config.json");
// Require file module
const fs = require('fs');
// get keys
var privateKey = fs.readFileSync( config.ssl_private_key );
var certificate = fs.readFileSync( config.ssl_certificate );
// create needed servers using certificates
var https_cloud = require('https').createServer( {
                                            key: privateKey,
                                            cert: certificate
                                        }, app);

var https_socket = require('https').createServer( {
                                            key: privateKey,
                                            cert: certificate
                                        }, app_socket);

// create socket for cloud
var io_cloud = require('socket.io')(https_socket);


https_cloud.listen(regular_port, 'hyland.pw', function(){
  console.log('CLOUD listening APP events CloudServer:' + regular_port);
}).on('error', function(err) {
  console.log('\n------------------------------------\nNetworking ERROR.\nCannot listen to: '+regular_port+' on CloudServer\nPlease check your Network settings\n------------------------------------\n' + err);
  process.exit();
});


https_socket.listen(9001, function(){
  console.log('CLOUD listening SOCKET events CloudServer:9001');
}).on('error', function(err) {
  console.log('\n------------------------------------\nNetworking ERROR.\nCannot listen to: 9001 on CloudServer\nPlease check your Network settings\n------------------------------------\n');
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


//set app routes
app.get('/cloud', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/client.html');
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;