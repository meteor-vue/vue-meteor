
import Vue from 'vue'
import {Reload} from 'meteor/reload'
import {Meteor} from 'meteor/meteor'
import {Tracker} from 'meteor/tracker'
import {Autoupdate} from 'meteor/autoupdate'
import {ReactiveVar} from 'meteor/reactive-var'
import VueHot1 from './vue-hot'
import VueHot2 from './vue2-hot'

let VueHotReloadApi
const vueVersion = parseInt(Vue.version.charAt(0))

console.log('[HMR] Vue', Vue.version)
if (vueVersion === 1) {
  VueHotReloadApi = VueHot1
} else if (vueVersion === 2) {
  VueHotReloadApi = VueHot2
}

Vue.use(VueHotReloadApi)

// Hot reload API
window.__vue_hot__ = VueHotReloadApi

// Records initialized before vue hot reload api
if (window.__vue_hot_pending__) {
  for (let hash in window.__vue_hot_pending__) {
    VueHotReloadApi.createRecord(hash, window.__vue_hot_pending__[hash])
  }
}

// Reload override
var _suppressNextReload = false, _deferReload = 0
var _reload = Reload._reload
Reload._reload = function (options) {
  // Disable original reload for autoupdate package
  if (Reload._reload.caller.name !== '' && Reload._reload.caller.name !== 'checkNewVersionDocument') {
    _reload(options)
  }
}

// Custom reload method
function reload (options) {
  console.log('[HMR] Reload request received')
  if (_deferReload !== 0) {
    setTimeout(_reload, _deferReload)
    console.log(`[HMR] Client reload defered, will reload in ${_deferReload} ms`)
  } else if (_suppressNextReload) {
    console.log(`[HMR] Client version changed, you may need to reload the page`)
  } else {
    console.log(`[HMR] Reloading app...`)
    _reload.call(Reload, options)
  }
  _suppressNextReload = false
  _deferReload = 0
}

// Reimplement client version check from autoupdate package
var autoupdateVersion = __meteor_runtime_config__.autoupdateVersion || `unknown`
var ClientVersions = Autoupdate._ClientVersions
if (ClientVersions) {
  function checkNewVersionDocument (doc) {
    if (doc._id === 'version' && doc.version !== autoupdateVersion) {
      reload()
    }
  }
  ClientVersions.find().observe({
    added: checkNewVersionDocument,
    changed: checkNewVersionDocument,
  })
} else {
  console.log('[HMR] ClientVersions collection is not available, the app may full reload.')
}

// Hack https://github.com/socketio/socket.io-client/issues/961
import Response from 'meteor-node-stubs/node_modules/http-browserify/lib/response'
if (!Response.prototype.setEncoding) {
  Response.prototype.setEncoding = function (encoding) {
        // do nothing
  }
}

Meteor.startup(function () {
  // Dev client
  let port = __meteor_runtime_config__.VUE_DEV_SERVER_PORT || 3003
  let devUrl = __meteor_runtime_config__.VUE_DEV_SERVER_URL || null

  if (devUrl) {
    console.log('[HMR] Dev client URL', devUrl)
  } else {
    devUrl = `${Meteor.absoluteUrl().replace(new RegExp(':\\d+\\/', 'gi'), '')}:${port}`
    console.log('[HMR] Dev client port', port)
  }

  // NOTE: Socket lib don't allow mix HTTP and HTTPS servers URLs on client!
  let _socket = require('socket.io-client')(devUrl)
  window.__dev_client__ = _socket

  _socket.on('connect', function () {
    console.log('[HMR] Dev client connected')
  })
  _socket.on('disconnect', function () {
    console.log('[HMR] Dev client disconnected')
  })

  // JS
  _socket.on('js', Meteor.bindEnvironment(function ({hash, js, template, path}) {
    let args = ['vue']
    let regResult
    let error = null
    while (regResult = jsImportsReg.exec(js)) {
      args.push(regResult[2])
    }
    args.push(function (require, exports, module) {
      try {
        eval(js)
      } catch (e) {
        console.error(e)
        error = e
      }
    })

    let id = `${path + Math.round(new Date().getTime())}.js`
    const files = id.split('/')
    const fileObj = {}
    let currentObj = fileObj
    const indexMax = files.length - 1
    files.forEach((file, index) => {
      if (index === indexMax) {
        currentObj[file] = args
      } else {
        currentObj = currentObj[file] = {}
      }
    })

    let require = meteorInstall(fileObj)
    let result = require('./' + id)

    let needsReload = false
    if (!error) {
      console.log('[HMR] Reloading ' + path)
      // console.log(js)
      // console.log(result.default)
      try {
        if (vueVersion === 1) {
          needsReload = VueHotReloadApi.update(hash, result.default, template)
        } else if (vueVersion === 2) {
          needsReload = VueHotReloadApi.reload(hash, result.default, template)
        }
      } catch (e) {
        console.error(e)
        error = true
      }
    }

    _suppressNextReload = !error && !needsReload
  }))

  // Template
  _socket.on('render', function ({hash, template, path}) {
    if (vueVersion === 2) {
      console.log('[HMR] Rerendering ' + path)
      // console.log(template)
      var obj
      eval(`obj = ${template};`)
      // console.log(obj)
      VueHotReloadApi.rerender(hash, obj)
      _suppressNextReload = true
    }
  })

  // CSS
  let _styleNodes = {}
  _socket.on('css', function ({hash, css, path}) {
    // console.log('css', hash, css.length);
    let style = _styleNodes[hash]
    if (!style) {
      style = document.createElement('style')
      style.setAttribute('data-v-source-file', path)
      document.getElementsByTagName('head')[0].appendChild(style)
      _styleNodes[hash] = style
    }
    style.textContent = css
  })

  // Locale
  _socket.on('lang.updated', function ({lang, data}) {
    Vue.locale(lang, data)
    if (lang === Vue.config.lang) {
      // Refresh
      VueHotReloadApi.updateWatchers()
    }
    console.log(`[HMR] Updated locale ${lang}`)
    _suppressNextReload = true
  })
  _socket.on('langs.updated', function ({langs}) {
    _deferReload = 3000
  })

  // Reg
  const jsImportsReg = /module\.import\((['"])(.+?)\1/g
})
