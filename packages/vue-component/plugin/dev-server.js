import http from 'http';
import socket_io from 'socket.io';
import {Meteor} from 'meteor/meteor';

if(global._dev_server_http) {
  global._dev_server_http.close();
  delete global._dev_server_http;
}

if(Meteor.isDevelopment) {
  var server = http.createServer();
  var io = socket_io(server);

  // Stored dynamic styles
  io.__styles = {};
  io.__addStyle = function({hash, css}, emit = true) {
    io.__styles[hash] = css;

    if(emit) {
      io.emit('css', {hash, css});
    }
  };

  // Send all stored dynamic styles to new clients
  io.on('connection', function (socket) {
    for(var hash in io.__styles) {
      socket.emit('css', {hash, css:io.__styles[hash]});
    }
  });

  PORT = 4242;

  try {
    server.listen(PORT);
    console.log(`\nDev server (vue-components) listening on port ${PORT}`);
    global._dev_server = io;
    global._dev_server_http = server;
  } catch(e) {
    console.log(e);
  }
}
