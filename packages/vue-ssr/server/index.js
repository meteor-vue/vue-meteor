import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import VueServerRenderer from 'vue-server-renderer/build.js'
import { WebApp } from 'meteor/webapp'

VueSSR = {
  createApp () {
    return new Vue({
      template: `<div id="not-the-app" style="font-family: sans-serif;">
        <h1>This is not what you expected</h1>
        <p>
          You need to tell <code>vue-ssr</code> how to create your app by setting the <code>VueSSR.createApp</code> function. It should return a new Vue instance.
        </p>
        <p>
          Here is an example of server-side code:
        </p>
        <pre style="background: #ddd; padding: 12px; border-radius: 3px; font-family: monospace;">import Vue from 'vue'
import { VueSSR } from 'meteor/akryum:vue-ssr'

function createApp () {
  return new Vue({
    render: h => h('div', 'Hello world'),
  })
}

VueSSR.createApp = createApp</pre>
      </div>`,
    })
  }
}

const renderer = VueServerRenderer.createRenderer()

function writeServerError (res) {
  res.writeHead(500)
  res.end('Server Error')
}

WebApp.connectHandlers.use((req, res, next) => {
  let asyncResult
  const result = VueSSR.createApp({ url: req.url })
  if (result && typeof result.then === 'function') {
    asyncResult = result
  } else {
    asyncResult = Promise.resolve(result)
  }
  asyncResult.then(app => {
    renderer.renderToString(
      app,
      (error, html) => {
        if (error) {
          console.error(error)
          writeServerError(res)
          return
        }
        req.dynamicBody = html
        next()
      },
    )
  }).catch(e => {
    console.error(e)
    writeServerError(res)
  })
})
