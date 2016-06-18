
import {Vue} from 'meteor/akryum:vue';
import VueHotReloadApi from './vue-hot';
import {Reload} from 'meteor/reload';
import {Meteor} from 'meteor/meteor';

Vue.use(VueHotReloadApi);

// Hot reload API
window.__vue_hot__ = VueHotReloadApi;

// Records initialized before vue hot reload api
if(window.__vue_hot_pending__) {
  for(let hash in window.__vue_hot_pending__) {
    VueHotReloadApi.createRecord(hash, window.__vue_hot_pending__[hash]);
  }
}

var _supressNextReload = false;
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

// Hack https://github.com/socketio/socket.io-client/issues/961
import Response from 'meteor-node-stubs/node_modules/http-browserify/lib/response';
if(!Response.prototype.setEncoding) {
    Response.prototype.setEncoding = function(encoding){
        // do nothing
    }
}

Meteor.startup(function() {
  // Dev client
  let port = window.__hot_port__ || 3003;
  console.log('dev client port', port);
  let _socket = require('socket.io-client')(`http://localhost:${port}`);
  _socket.on('connect', function() {
    console.log('Dev client connected');
  });
  _socket.on('disconnect', function() {
    console.log('Dev client disconnected');
  });

  // JS
  _socket.on('js', Meteor.bindEnvironment(function({hash, js, template}) {
    _supressNextReload = true;
    let args = ['meteor/akryum:vue'];
    let regResult;
    while(regResult = jsImportsReg.exec(js)) {
      args.push(regResult[2]);
    }
    args.push(function(require,exports,module){
      eval(js);
    });
    let id = `_component${(new Date()).getTime()}.js`;
    let require = meteorInstall({[id]:args});
    let result = require('./' + id);
    VueHotReloadApi.update(hash, result.default, template);
  }));

  // CSS
  let _styleNodes = {};
  _socket.on('css', function({hash, css}) {
    let style = _styleNodes[hash];
    if(!style) {
      style = document.createElement('style');
      document.getElementsByTagName('head')[0].appendChild(style);
      _styleNodes[hash] = style;
    }
    style.textContent = css;
  });

  window.__dev_client__ = _socket;

  // Reg
  const jsImportsReg = /module\.import\((['"])(.+)\1/g;
})
