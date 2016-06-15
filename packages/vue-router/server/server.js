import RouteRecognizer from './route-recognizer';

const internalKeysRE = /^(sendData|subRoutes|fullPath)$/

class RouterClass {
  constructor() {
    this._recognizer = new RouteRecognizer();
    this._start();
  }

  map(def) {
    for (let key in def) {
      this.on(key, def[key]);
    }
  }

  on(rootPath, handler) {
    this._addRoute(rootPath, handler, []);
  }

  _start() {
    WebApp.connectHandlers.use((req, res, next) => {
      this._handleRequest({ req, res }, next);
    });
  }

  _addRoute(path, handler, segments) {
    handler.path = path;
    handler.fullPath = (segments.reduce((path, segment) => {
      return path + segment.path;
    }, '') + path).replace('//', '/');
    segments.push({
      path: path,
      handler: handler
    });
    this._recognizer.add(segments, {
      as: handler.name
    });
    // add sub routes
    if (handler.subRoutes) {
      for (let subPath in handler.subRoutes) {
        // recursively walk all sub routes
        this._addRoute(
          subPath,
          handler.subRoutes[subPath],
          // pass a copy in recursion to avoid mutating
          // across branches
          segments.slice()
        )
      }
    }
  }

  _handleRequest({ req, res }, done) {
    let result = {};
    let path = req.url;
    const matched = this._recognizer.recognize(path);
    if (matched) {
      console.log("matched!");
      // copy all custom fields from route configs
      [].forEach.call(matched, match => {
        for (let key in match.handler) {
          if (!internalKeysRE.test(key)) {
            result[key] = match.handler[key];
          }
        }
      });
      // set query and params
      result.query = matched.queryParams;
      result.params = [].reduce.call(matched, (prev, cur) => {
        if (cur.params) {
          for (let key in cur.params) {
            prev[key] = cur.params[key];
          }
        }
        return prev
      }, {});
      // expose path and router
      result.path = path;
      // for internal use
      result.matched = matched;

      console.log(result);

    }

    done();
  }
}

export const Router = new RouterClass();
