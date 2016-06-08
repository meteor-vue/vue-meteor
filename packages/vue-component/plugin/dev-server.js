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
