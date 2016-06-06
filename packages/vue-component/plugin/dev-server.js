import http from 'http';
import socket_io from 'socket.io';

if(global._dev_server_http) {
  global._dev_server_http.close();
}

var server = http.createServer();
var io = socket_io(server);

PORT = 4242;

try {
  server.listen(PORT);
  console.log(`\nDev server listening on port ${PORT}`);
  global._dev_server = io;
  global._dev_server_http = server;
} catch(e) {
  console.log(e);
}
