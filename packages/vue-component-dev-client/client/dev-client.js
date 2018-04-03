import './buffer'
import Vue from 'vue'
import { Reload } from 'meteor/reload'
import { Meteor } from 'meteor/meteor'
import { Autoupdate } from 'meteor/autoupdate'
import VueHot1 from './vue-hot'
import VueHot2 from './vue2-hot'
// Hack https://github.com/socketio/socket.io-client/issues/961
import Response from 'meteor-node-stubs/node_modules/https-browserify/lib/response'

const tagStyle = 'padding: 2px 4px 1px; background: #326ABC; color: white; border-radius: 3px; font-weight: bold;'
const infoStyle = 'font-style: italic; color: #326ABC;'

let VueHotReloadApi
const vueVersion = parseInt(Vue.version.charAt(0))

console.log('%cHRM%c You are using Vue %c' + Vue.version, tagStyle, 'color: #177D4F;', 'color: #177D4F; font-weight: bold;')

console.log('%cYou are currently in development mode. If the Hot-Module-Replacement system is enabled (`on` by default), the CSS will be injected to the page after the scripts are loaded. This may result in Flash Of Unstyled Contents. Those will not occur in production.', infoStyle)

console.log('%cMore information about the component compilation: https://github.com/meteor-vue/vue-meteor/tree/master/packages/vue-component', infoStyle)

console.log('%cDocumentation and Issues: https://github.com/meteor-vue/vue-meteor', infoStyle)

if (vueVersion === 1) {
  VueHotReloadApi = VueHot1
} else if (vueVersion === 2) {
  VueHotReloadApi = VueHot2
  Vue.config.productionTip = false
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
var _suppressNextReload = false
let _deferReload = 0
var _reload = Reload._reload
Reload._reload = function (options) {
  // Disable original reload for autoupdate package
  if (Reload._reload.caller.name !== '' && Reload._reload.caller.name !== 'checkNewVersionDocument') {
    _reload(options)
  }
}

// Custom reload method
function reload (options) {
  console.log('%cHRM', tagStyle, 'Reload request received')
  if (_deferReload !== 0) {
    setTimeout(_reload, _deferReload)
    console.log(`%cHRM`, tagStyle, `Client reload defered, will reload in ${_deferReload} ms`)
  } else if (_suppressNextReload) {
    console.log(`%cHRM%c ⥁ Client version changed, reload suppressed because of a recent HMR update. You may need to reload the page.`, tagStyle, 'color: #F36E00;')
  } else {
    console.log(`%cHRM`, tagStyle, `Reloading app...`)
    _reload.call(Reload, options)
  }
  _suppressNextReload = false
  _deferReload = 0
}

// Reimplement client version check from autoupdate package
function checkNewVersionDocument (doc) {
  if (doc._id === 'version' && doc.version !== autoupdateVersion) {
    reload()
  }
}
var autoupdateVersion = __meteor_runtime_config__.autoupdateVersion || `unknown`
var ClientVersions = Autoupdate._ClientVersions
if (ClientVersions) {
  ClientVersions.find().observe({
    added: checkNewVersionDocument,
    changed: checkNewVersionDocument,
  })
} else {
  console.warn('%cHRM', tagStyle, 'ClientVersions collection is not available, the app may full reload.')
}

// Hack https://github.com/socketio/socket.io-client/issues/961
if (!Response.prototype.setEncoding) {
  Response.prototype.setEncoding = function (encoding) {
    // do nothing
  }
}

Meteor.startup(function () {
  // Dev client
  let devUrl = __meteor_runtime_config__.VUE_DEV_SERVER_URL

  console.log('%cHRM%c Dev server URL: %c' + devUrl, tagStyle, '', 'font-weight: bold;')

  console.log(`%cIf you have issues connecting to the dev server, set the 'HMR_URL' env variable to the URL of the dev server displayed in the meteor console.`, infoStyle)

  // NOTE: Socket lib don't allow mix HTTP and HTTPS servers URLs on client!
  let _socket = require('socket.io-client')(devUrl)
  window.__dev_client__ = _socket

  _socket.on('connect', function () {
    console.log('%cHRM%c ⏺ Dev client connected', tagStyle, 'color: #177D4F;')
  })
  _socket.on('disconnect', function () {
    console.log('%cHRM%c ⏺ Dev client disconnected', tagStyle, 'color: #F36E00;')
  })

  // JS
  _socket.on('js', Meteor.bindEnvironment(function ({hash, js, template, path}) {
    let args = ['vue']
    let regResult
    let error = null
    while ((regResult = jsImportsReg.exec(js))) {
      args.push(regResult[2])
    }
    args.push(function (require, exports, module) {
      try {
        // eslint-disable-next-line no-eval
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
      console.log('%cHRM', tagStyle, 'Reloading ' + path)
      if (!result.default.render && !template) {
        error = true
      }
      if (!error) {
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
    }

    _suppressNextReload = !error && !needsReload
  }))

  // Template
  _socket.on('render', function ({hash, template, path}) {
    if (vueVersion === 2) {
      console.log('%cHRM', tagStyle, 'Rerendering ' + path)
      let error = false
      try {
        var obj
        // eslint-disable-next-line no-eval
        eval(`obj = ${template};`)
        // console.log(obj)
        VueHotReloadApi.rerender(hash, obj)
      } catch (e) {
        error = true
      }
      _suppressNextReload = !error
    }
  })

  // CSS
  let _styleNodes = {}
  _socket.on('css', function ({hash, css, path}) {
    // console.log('css', hash, css.length)
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
    console.log(`%cHRM`, tagStyle, `Updated locale ${lang}`)
    _suppressNextReload = true
  })
  _socket.on('langs.updated', function ({langs}) {
    _deferReload = 3000
  })

  // Message
  _socket.on('message', function ({ type, message }) {
    let func
    if (type === 'error') {
      func = console.error
    } else if (type === 'warn') {
      func = console.warn
    } else {
      func = console.log
    }
    func(`%cHRM`, tagStyle, message)
  })

  // Reg
  const jsImportsReg = /module\.import\((['"])(.+?)\1/g
})
