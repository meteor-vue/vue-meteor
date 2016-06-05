import http from 'http';
import socket_io from 'socket.io';

if(global._dev_server) {
  global._dev_server.close();
}

var server = http.createServer();
var io = socket_io(server);

PORT = 4242;

io.on('connection', (socket) => {
  console.log(`new client ${socket.id}`);
});

try {
  server.listen(PORT);
  console.log(`Dev server listening on port ${PORT}`);
  global._dev_server = server;
} catch(e) {
  console.log(e);
}
