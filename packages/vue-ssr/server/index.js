import { createRenderer } from 'vue-server-renderer'
import { WebApp } from 'meteor/webapp'
import cookieParser from 'cookie-parser'
import { onPageLoad } from 'meteor/server-render'
import { FastRender } from 'meteor/cloudspider:fast-render'

import defaultAppTemplate from './lib/defaultAppTemplate'
import createDefaultApp from './lib/createDefaultApp'

import SsrContext from './context'
import patchSubscribeData from './data'

export { default as IsAppUrl } from './lib/isAppUrl'

const VueSSR = {}

VueSSR.outlet = process.env.VUE_OUTLET || 'app'
VueSSR.defaultAppTemplate = defaultAppTemplate
VueSSR.createApp = createDefaultApp()
VueSSR.ssrContext = new Meteor.EnvironmentVariable()
VueSSR.inSubscription = new Meteor.EnvironmentVariable() // <-- needed in data.js

patchSubscribeData(VueSSR)

const renderer = createRenderer()

function writeServerError(sink) {
  sink.appendToBody('Server Error')
}

WebApp.rawConnectHandlers.use(cookieParser())

onPageLoad(sink => new Promise((resolve, reject) => {
  const req = sink.request

  // Fast render
  const loginToken = req.cookies['meteor_login_token']
  const headers = req.headers
  const frLoginContext = new FastRender._Context(loginToken, { headers })

  FastRender.frContext.withValue(frLoginContext, function () {
    // we're stealing all the code from FlowRouter SSR
    // https://github.com/kadirahq/flow-router/blob/ssr/server/route.js#L61
    const ssrContext = new SsrContext()

    VueSSR.ssrContext.withValue(ssrContext, async () => {
      try {
        // Vue
        const context = { url: req.url }

        const result = VueSSR.createApp(context)

        const asyncResult = typeof result.then === 'function' ? result : Promise.resolve(result)

        const app = await asyncResult

        renderer.renderToString(
          app,
          context,
          (error, html) => {
            if (error) {
              console.error(error)
              writeServerError(sink)
              return
            }

            const appendHtml = typeof context.appendHtml === 'function' && context.appendHtml()

            const head = ((appendHtml && appendHtml.head) || context.head) || ''
            const body = ((appendHtml && appendHtml.body) || context.body) || ''
            const js = ((appendHtml && appendHtml.js) || context.js) || ''

            const script = js && `<script type="text/javascript">${js}</script>`

            sink.renderIntoElementById(VueSSR.outlet, html)
            sink.appendToHead(head)
            sink.appendToBody([body, script])

            resolve()
          }
        )
      } catch (error) {
        console.error(error)
        writeServerError(sink)
        resolve()
      }
    })
  })
}))

export { VueSSR }
