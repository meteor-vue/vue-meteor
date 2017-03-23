import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import VueServerRenderer from 'vue-server-renderer/build.js'
import { WebApp } from 'meteor/webapp'
import cookieParser from 'cookie-parser'
import Cheerio from 'cheerio'

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

VueSSR.outlet = process.env.VUE_OUTLET || '<!--vue-ssr-outlet-->'

VueSSR.template = VueSSR.outlet

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

const renderer = VueServerRenderer.createRenderer()

function writeServerError (res) {
  res.writeHead(500)
  res.end('Server Error')
}

Meteor.bindEnvironment(function () {
  WebApp.rawConnectHandlers.use(cookieParser())

  WebApp.connectHandlers.use((req, res, next) => {
    if (!IsAppUrl(req)) {
      next()
      return
    }

    // Fast render
    const loginToken = req.cookies['meteor_login_token']
    const headers = req.headers
    const frLoginContext = new FastRender._Context(loginToken, { headers })

    FastRender.frContext.withValue(frLoginContext, function() {

      // we're stealing all the code from FlowRouter SSR
      // https://github.com/kadirahq/flow-router/blob/ssr/server/route.js#L61
      const ssrContext = new SsrContext()

      VueSSR.ssrContext.withValue(ssrContext, () => {
        try {
          const frData = InjectData.getData(res, 'fast-render-data')
          if (frData) {
            ssrContext.addData(frData.collectionData)
          }

          // Vue
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

                const frContext = FastRender.frContext.get()
                const data = frContext.getData()
                InjectData.pushData(res, 'fast-render-data', data)

                res.write = patchResWrite(res.write, VueSSR.template.replace(VueSSR.outlet, html))

                next()
              },
            )
          }).catch(e => {
            console.error(e)
            writeServerError(res)
          })

        } catch (error) {
          console.error(error)
          writeServerError(res)
        }
      })

    })
  })
})()

function patchResWrite(originalWrite, html) {
  return function(data) {
    if(typeof data === 'string' && data.indexOf('<!DOCTYPE html>') === 0) {
      if (data.indexOf(VueSSR.outlet) !== -1) {
        data = data.replace(VueSSR.outlet, html);
      } else {
        data = moveScripts(data);
        data = data.replace('<body>', '<body>' + html);
      }
    }

    originalWrite.call(this, data);
  };
}

function moveScripts(data) {
  const $ = Cheerio.load(data, {
    decodeEntities: false
  });
  const heads = $('head script');
  $('body').append(heads);
  $('head').html($('head').html().replace(/(^[ \t]*\n)/gm, ''));

  return $.html();
}
