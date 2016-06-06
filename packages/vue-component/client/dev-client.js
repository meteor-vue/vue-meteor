
import {Vue} from 'meteor/akryum:vue';
import VueHotReloadApi from './vue-hot';
import {Reload} from 'meteor/reload';
import {Meteor} from 'meteor/meteor';

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

var _supressNextReload = false;

// JS
_socket.on('js', Meteor.bindEnvironment(function({hash, js, template}) {
  _supressNextReload = true;
  var exports = {};
  let result = eval(js);
  VueHotReloadApi.update(hash, result, template);
}));

// CSS
var _styleNodes = {};
_socket.on('css', function({hash, css}) {
  let style = _styleNodes[hash];
  if(!style) {
    style = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(style);
    _styleNodes[hash] = style;
  }
  style.textContent = css;
  //_supressNextReload = true;
});

window.__dev_client__ = _socket;

// Hot reload API
window.__vue_hot__ = VueHotReloadApi;

var _reload = Reload._reload;
Reload._reload = function(options) {
  console.log('[[ Reload request ]]');
  if(_supressNextReload) {
    console.log("[[ Client changed, may need reload ]]");
  } else {
    console.log("[[ Reloading app... ]]");
    _reload.call(Reload, options);
  }
  _supressNextReload = false;
}

console.log(Vue);
