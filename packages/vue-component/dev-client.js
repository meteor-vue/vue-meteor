
import {Vue} from 'meteor/akryum:vue';
import VueHotReloadApi from 'vue-hot-reload-api';
import {Reload} from 'meteor/reload';

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
_socket.on('connect', function() {
  console.log('Dev client connected');
});
_socket.on('disconnect', function() {
  console.log('Dev client disconnected');
});

// JS
_socket.on('js', function({hash, js}) {
  var exports = {};
  let result = eval(js);
  console.log('dev client js', hash, result, exports);
  VueHotReloadApi.update(hash, result);
});

// CSS
var _styleNodes = {};
_socket.on('css', function({hash, css}) {
  console.log('dev client css', hash, css);
  let style = _styleNodes[hash];
  if(!style) {
    style = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(style);
    _styleNodes[hash] = style;
  }
  style.textContent = css;
});

window.__dev_client__ = _socket;

// Hot reload API
window.__vue_hot__ = VueHotReloadApi;

const r = Reload._reload;
Reload._reload = function() {
  console.log("Client changed, may need reload");
}
