
import {Vue} from 'meteor/akryum:vue';
import VueHotReloadApi from 'vue-hot-reload-api';

Vue.use(VueHotReloadApi);

// Hack https://github.com/socketio/socket.io-client/issues/961
import Response from 'meteor-node-stubs/node_modules/http-browserify/lib/response';
if(!Response.prototype.setEncoding) {
    Response.prototype.setEncoding = function(encoding){
        // do nothing
    }
}

// Dev client
var _socket = require('socket.io-client')('http://localhost:4242');
_socket.on('js', function(js) {
  let result = eval(js);
  console.log(result);
});
window.__dev_client__ = _socket;

// Hot reload API
window.__vue_hot__ = VueHotReloadApi;
