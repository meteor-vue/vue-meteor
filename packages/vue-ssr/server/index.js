import Vue from 'vue'
import { createRenderer } from 'vue-server-renderer'
import { WebApp } from 'meteor/webapp'
import cookieParser from 'cookie-parser'
import { FastRender } from 'meteor/communitypackages:fast-render'

import SsrContext from './context'
import patchSubscribeData from './data'

function IsAppUrl (req) {
  var url = req.url
  if (url === '/favicon.ico' || url === '/robots.txt') {
    return false
  }

  if (url === '/app.manifest') {
    return false
  }

  // Avoid serving app HTML for declared routes such as /sockjs/.
  if (RoutePolicy.classify(url)) {
    return false
  }
  return true
}

VueSSR = {}

VueSSR.outlet = process.env.VUE_OUTLET || 'app'

VueSSR.defaultAppTemplate = `
<div id="not-the-app" style="font-family: sans-serif;">
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
</div>
`

VueSSR.createApp = function () {
  return new Vue({
    template: VueSSR.defaultAppTemplate,
  })
}

VueSSR.ssrContext = new Meteor.EnvironmentVariable()
VueSSR.inSubscription = new Meteor.EnvironmentVariable() // <-- needed in data.js

patchSubscribeData(VueSSR)

const renderer = createRenderer()

function writeServerError (sink) {
  sink.appendToBody('Server Error')
}

WebApp.rawConnectHandlers.use(cookieParser())

FastRender.onPageLoad(sink => new Promise(async (resolve, reject) => {
  const req = sink.request

  const ssrContext = new SsrContext()

  await VueSSR.ssrContext.withValue(ssrContext, () => {
    try {
      // Vue
      const context = { url: req.url }
      let asyncResult
      const result = VueSSR.createApp(context)
      if (result && typeof result.then === 'function') {
        asyncResult = result
      } else {
        asyncResult = Promise.resolve(result)
      }

      asyncResult.then(app => {
        renderer.renderToString(
          app,
          context,
          (error, html) => {
            if (error) {
              console.error(error)
              writeServerError(sink)
              return
            }

            let appendHtml
            if (typeof context.appendHtml === 'function') appendHtml = context.appendHtml()

            const head = ((appendHtml && appendHtml.head) || context.head) || ''
            const body = ((appendHtml && appendHtml.body) || context.body) || ''
            const js = ((appendHtml && appendHtml.js) || context.js) || ''

            const script = js && `<script type="text/javascript">${js}</script>`

            sink.renderIntoElementById(VueSSR.outlet, html)
            sink.appendToHead(head)
            sink.appendToBody([body, script])

            resolve()
          },
        )
      }).catch(e => {
        console.error(e)
        writeServerError(sink)
        resolve()
      })
    } catch (error) {
      console.error(error)
      writeServerError(sink)
      resolve()
    }
  })
}))
