// middleware to isolate some funcs
var middleware = require("./middleware.js");

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var regular_port = normalizePort(process.env.PORT || 9000);


app.set('port', regular_port);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));



var config = require("./config.json");
// Require file module
const fs = require('fs');
// set HTTPS createServer
var privateKey = fs.readFileSync( config.ssl_private_key );
var certificate = fs.readFileSync( config.ssl_certificate );

// create needed servers
var server = require('https').createServer( {
                                            key: privateKey,
                                            cert: certificate
                                        }, app);
var https_stream_cloud = require('https').createServer( {
                                            key: privateKey,
                                            cert: certificate
                                        }, app);


var ExpressPeerServer = require('peer').ExpressPeerServer;

var io_cloud = require('socket.io')(server);






//start express LIVE (for streaming)
https_stream_cloud.listen(3002, function(){
  console.log('CLOUD listening STREAM events CloudServer:3002');
}).on('error', function(err) {
  console.log('\n------------------------------------\nNetworking ERROR.\nCannot listen to: 3002 on CloudServer\nPlease check your Network settings\n------------------------------------\n');
  process.exit();
});

app.use('/rt', ExpressPeerServer(https_stream_cloud, {debug: 3}));

//start express LIVE
/*server.listen(regular_port, function(){
  console.log('CLOUD listening events on heroku?:9000');
}).on('error', function(err) {
  console.log('\n------------------------------------\nNetworking ERROR.\nCannot listen to: cloud:' + regular_port + '\nPlease check your Network settings\n------------------------------------\n');
  process.exit();
});*/



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























app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/client', function(req, res){
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




function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}