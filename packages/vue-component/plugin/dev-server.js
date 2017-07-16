import http from 'http';
import socket_io from 'socket.io';
import {Meteor} from 'meteor/meteor';

if(global._dev_server_http) {
  global._dev_server.close();
  global._dev_server_http.close();
  delete global._dev_server;
  delete global._dev_server_http;
}

if(Meteor.isDevelopment) {
  var server = http.createServer();
  var io = socket_io(server, {
    serveClient: false,
  });

  // Stored dynamic styles
  io.__styles = {};
  io.__addStyle = function({hash, css, path}, emit = true) {
    if(emit) {
      io.emit('css', {hash, css, path});
    }
    io.__styles[hash] = {
      hash,
      css,
      path
    };
  };

  // Send all stored dynamic styles to new clients
  io.on('connection', function (socket) {
    for(var hash in io.__styles) {
      socket.emit('css', io.__styles[hash]);
    }
  });

  function getMeteorBinding() {
    const reg = /(?:--port|-p)(?:=|\s)(?:([0-9.]+):)?(\d+)/gi;
    const argv = this.process.argv;
    const result = reg.exec(argv);
    if(result && result.length >= 2) {
      let interface = result[1];
      let port = parseInt(result[2]);
      return {interface, port};
    }
    return {}
  }

  PORT = parseInt(process.env.HMR_PORT) || parseInt(process.env.VUE_DEV_SERVER_PORT) || getMeteorBinding().port+3 || 3003;
  INTERFACE = getMeteorBinding().interface

  try {
    if( INTERFACE ) {
      server.listen(PORT, INTERFACE);
    }
    else {
      server.listen(PORT)
    }
    if (process.stdout.clearLine) {
        process.stdout.clearLine();
    }
    process.stdout.write(`\r   [HMR] Dev server listening on port ${PORT}\n`);
    global._dev_server = io;
    global._dev_server_http = server;
  } catch(e) {
    console.log(e);
  }
}
