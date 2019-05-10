import fs from 'fs'
import Future from 'fibers/future'
import async from 'async'
import { Meteor } from 'meteor/meteor'
import _ from 'lodash'
import 'colors'

let defaultTemplateCompiler, defaultTranspile
const loadDefaultTemplateCompiler = () => defaultTemplateCompiler || (defaultTemplateCompiler = require('vue-template-compiler'))
const loadDefaultTranspiler = () => defaultTranspile || (defaultTranspile = require('vue-template-es2015-compiler'))

function toFunction (code) {
  return 'function (){' + code + '}'
}

// Cache
global._vue_cache = global._vue_cache || {}

// Babel cache directory
process.env.BABEL_CACHE_DIR = process.env.BABEL_CACHE_DIR || '.cache'

const babelOptions = Babel.getDefaultOptions()

// Compiler
VueComponentCompiler = class VueCompo extends CachingCompiler {
  constructor () {
    super({
      compilerName: 'vuecomponent',
      defaultCacheSize: 1024 * 1024 * 10,
    })
  }

  processFilesForTarget (inputFiles) {
    const cacheMisses = []

    this.updateIgnoredConfig(inputFiles)

    // console.log(`Found ${inputFiles.length} files.`)

    const future = new Future()
    async.eachLimit(inputFiles, this._maxParallelism, (inputFile, cb) => {
      if (!this.isIgnored(inputFile)) {
        let error = null
        try {
          const cacheKey = this._deepHash(this.getCacheKey(inputFile))
          let compileResult = this._cache.get(cacheKey)

          if (!compileResult) {
            compileResult = this._readCache(cacheKey)
            if (compileResult) {
              this._cacheDebug(`Loaded ${inputFile.getDisplayPath()}`)
            }
          }

          if (!compileResult) {
            cacheMisses.push(inputFile.getDisplayPath())
            compileResult = this.compileOneFile(inputFile)

            if (!compileResult) {
              // compileOneFile should have called inputFile.error.
              //  We don't cache failures for now.
              return
            }

            // Save what we've compiled.
            this._cache.set(cacheKey, compileResult)
            this._writeCacheAsync(cacheKey, compileResult)
          }

          this.addCompileResult(inputFile, compileResult)
        } catch (e) {
          error = e
        } finally {
          cb(error)
        }
      } else {
        cb()
      }
    }, future.resolver())
    future.wait()

    if (this._cacheDebugEnabled) {
      cacheMisses.sort()
      this._cacheDebug(
        `Ran (#${++this._callCount}) on: ${JSON.stringify(cacheMisses)}`)
    }
  }

  updateIgnoredConfig (inputFiles) {
    this.ignoreRules = []
    for (let inputFile of inputFiles) {
      if (inputFile.getBasename() === IGNORE_FILE) {
        const contents = normalizeCarriageReturns(inputFile.getContentsAsString())
        const lines = contents.split('\n')
        let dirname = getFullDirname(inputFile)
        if (dirname === '.') {
          dirname = ''
        }
        for (let line of lines) {
          if (line !== '') {
            this.ignoreRules.push({
              dirname,
              reg: new RegExp(line),
            })
          }
        }
      }
    }
  }

  isIgnored (inputFile) {
    if (inputFile.getBasename() === IGNORE_FILE) {
      return true
    }

    for (let rule of this.ignoreRules) {
      const dirname = getFullDirname(inputFile)
      if (dirname.indexOf(rule.dirname) === 0 && rule.reg.test(inputFile.getPathInPackage())) {
        return true
      }
    }
    return false
  }

  getCacheKey (inputFile) {
    let cache = Cache.getCache(inputFile)
    return [
      inputFile.getSourceHash(),
      inputFile.getPathInPackage(),
      cache.dependencyManager.lastChangeTime,
    ]
  }

  compileResultSize (compileResult) {
    return compileResult.code.length + compileResult.map.length
  }

  compileOneFile (inputFile) {
    const contents = inputFile.getContentsAsString()
    return compileOneFileWithContents(inputFile, contents, {
      template: true,
      script: true,
      style: true,
    }, babelOptions)
  }

  addCompileResult (inputFile, compileResult) {
    const inputFilePath = inputFile.getPathInPackage()
    const vueId = compileResult.hash
    const isDev = isDevelopment()

    let jsHash = Hash(compileResult.code)

    // console.log(`js hash: ${jsHash}`)

    // Lazy load files from NPM packages or imports directories
    const isLazy = !!inputFilePath.match(/(^|\/)(node_modules|imports)\//)

    const lazyCSS = !isDev && isLazy && inputFile.getArch().indexOf('web') !== -1

    // Style
    let css = ''
    let cssHash = ''
    let cssModulesHash = ''
    if (compileResult.styles.length !== 0) {
      for (let style of compileResult.styles) {
        css += style.css
      }

      cssHash = Hash(css)

      // console.log(`css hash: ${cssHash}`)

      if (compileResult.cssModules) {
        cssModulesHash = Hash(JSON.stringify(compileResult.cssModules))
      }
      // console.log(`css hash: ${cssHash}`)
      if (lazyCSS) {
        // Wrap CSS in Meteor's lazy CSS loader
        css = `\n
          const modules = require('meteor/modules');\n
          modules.addStyles(${JSON.stringify(css)});\n
        `
      }
    }

    const { js, templateHash } = generateJs(vueId, inputFile, compileResult)

    let outputFilePath = inputFilePath
    // Meteor will error when loading .vue files on the server unless they are postfixed with .js
    if (inputFile.getArch().indexOf('os') === 0 && inputFilePath.indexOf('node_modules') !== -1) {
      outputFilePath += '.js'
    }

    // Including the source maps for .vue files from node_modules breaks source mapping.
    const sourceMap = inputFilePath.indexOf('node_modules') === -1
      ? compileResult.map
      : undefined

    // Add JS Source file
    inputFile.addJavaScript({
      path: outputFilePath,
      data: lazyCSS ? css + js : js,
      sourceMap: sourceMap,
      lazy: isLazy,
    })

    if (css) {
      if (isDev) {
        // Add style to client first-connection style list
        global._dev_server.__addStyle({ hash: vueId, css, path: inputFilePath }, true)
      } else if (!isLazy) {
        // In order to avoid lazy-loading errors in --production mode, addStylesheet must come after addJavaScript
        this.addStylesheet(inputFile, {
          data: css,
        })
      }
    }

    if (isDev) {
      cache = Cache.getCache(inputFile)
      cache.watcher.update(inputFile)
      cache.filePath = getFilePath(inputFile)
      cache.js = jsHash
      cache.css = cssHash
      cache.cssModules = cssModulesHash
      cache.template = templateHash
    }
  }

  addStylesheet (inputFile, options) {
    const data = normalizeCarriageReturns(options.data)
    inputFile.addStylesheet({
      path: inputFile.getPathInPackage(),
      sourcePath: inputFile.getPathInPackage(),
      data: data,
      sourceMap: options.map,
      lazy: false,
    })
  }
}

class Cache {
  static getCacheKey (inputFile) {
    return FileHash(inputFile)
  }

  static getCache (inputFile) {
    const key = Cache.getCacheKey(inputFile)
    let result = global._vue_cache[key] || null
    if (result === null) {
      result = global._vue_cache[key] = Cache.createCache(key, inputFile)
    }
    return result
  }

  static createCache (key, inputFile) {
    const cache = {
      key,
      js: null,
      css: null,
      template: null,
      watcher: null,
      dependencyManager: null,
      filePath: getFullPathInApp(inputFile),
    }

    if (isDevelopment()) {
      cache.watcher = new ComponentWatcher(cache)
    }

    cache.dependencyManager = new DependencyManager('style', cache)

    return cache
  }

  static removeCache (key) {
    const cache = global._vue_cache[key]
    if (cache) {
      cache.watcher.remove()
      cache.dependencyManager.remove()
    }
    delete global._vue_cache[key]
  }
}

class ComponentWatcher {
  constructor (cache) {
    this.cache = cache
  }

  update (inputFile) {
    this.inputFile = inputFile
    const filePath = getFilePath(this.inputFile)
    this._watchPath(filePath)
  }

  refresh (parts) {
    if (!parts) {
      parts = {
        template: true,
        script: true,
        style: true,
      }
    }
    try {
      hotCompile(this.filePath, this.inputFile, this.cache, parts)
    } catch (e) {
      console.error(e)
    }
  }

  remove () {
    this._closeWatcher()
  }

  _closeWatcher () {
    if (this.watcher) {
      this.watcher.close()
    }
  }

  _watchPath (filePath) {
    if (!this.watcher || filePath !== this.filePath) {
      this.filePath = filePath
      // Fast file change detection
      this._closeWatcher()
      this.watcher = fs.watch(filePath, {
        persistent: false,
      })
      this.watcher.on('change', _.debounce(event => { // Refresh once
        this.refresh()
      }, 100, {
        leading: false,
        trailing: true,
      }))
      this.watcher.on('error', (error) => console.error(error))
    }
  }
}

const hotCompile = Meteor.bindEnvironment(function hotCompile (filePath, inputFile, cache, parts) {
  let inputFilePath = inputFile.getPathInPackage()
  let contents = Plugin.fs.readFileSync(filePath, {
    encoding: 'utf8',
  })
  let compileResult = compileOneFileWithContents(inputFile, contents, parts, babelOptions)
  if (!compileResult) {
    return
  }

  let vueId = compileResult.hash

  // CSS
  let css = ''
  let cssHash = ''
  let cssModulesHash = ''
  if (parts.style) {
    if (compileResult.styles.length !== 0) {
      for (let style of compileResult.styles) {
        css += style.css
      }

      // Hot-reloading
      cssHash = Hash(css)
      if (cache.css !== cssHash) {
        global._dev_server.__addStyle({ hash: vueId, css, path: inputFilePath }, true)
      }

      if (compileResult.cssModules) {
        cssModulesHash = Hash(JSON.stringify(compileResult.cssModules))
      }
    }
  }

  // JS & Template
  let jsHash, template, templateHash
  if (parts.script || parts.template) {
    if (parts.script) {
      jsHash = Hash(compileResult.code)
    }
    if (parts.template) {
      template = compileResult.template
      if (template) {
        templateHash = Hash(template)
      } else {
        templateHash = cache.template
      }
    }

    if (cache.js !== jsHash || cache.template !== templateHash || cache.cssModules !== cssModulesHash) {
      const path = (inputFile.getPackageName() ? `packages/${inputFile.getPackageName()}` : '') + inputFile.getPathInPackage()

      const { js, render, staticRenderFns } = generateJs(vueId, inputFile, compileResult, true)

      if (vueVersion === 2 && cache.js === jsHash && cache.cssModules === cssModulesHash) {
        global._dev_server.emit('render', { hash: vueId,
          template: `{
          render: ${render},
          staticRenderFns: ${staticRenderFns}
        }`,
          path })
      } else {
        global._dev_server.emit('js', { hash: vueId, js, template, path })
      }
    }
  }

  // Cache
  if (parts.script) {
    cache.js = jsHash
  }
  if (parts.style) {
    cache.css = cssHash
    cache.cssModules = cssModulesHash
  }
  if (parts.template) {
    cache.template = templateHash
  }
})

class DependencyWatcher {
  constructor () {
    this.files = {}
  }

  clearManager (manager) {
    for (let path in this.files) {
      this.removeDependency(path, manager)
    }
  }

  addDependency (path, manager) {
    let file = this.files[path]

    if (!file) {
      file = this.files[path] = {
        path,
        lastChangeTime: 0,
        managers: [manager],
        watcher: null,
      }

      file.watcher = fs.watch(path, {
        persistent: false,
      }, _.debounce(_ => this._fileChanged(file), 100, {
        leading: true,
        trailing: false,
      }))
    } else {
      file.managers.push(manager)
    }
  }

  removeDependency (path, manager) {
    const file = this.files[path]
    _.pull(file.managers, manager)
    if (file.managers.length === 0) {
      this.removeFile(file)
    }
  }

  removeFile (file) {
    if (file.watcher) {
      file.watcher.close()
    }
    delete this.files[file.path]
  }

  _fileChanged (file) {
    const lastChangeTime = file.lastChangeTime = new Date().getTime()
    for (let manager of file.managers) {
      manager.update(lastChangeTime)
    }
  }
}

const depWatcher = global.__vue_dep_watcher = global.__vue_dep_watcher || new DependencyWatcher()

class DependencyManager {
  constructor (type, cache) {
    this.type = type
    this.cache = cache
    this.lastChangeTime = 0

    this.parts = {
      template: false,
      script: false,
      style: false,
    }
    this.parts[this.type] = true

    this.watchedPaths = {}
  }

  addDependency (path) {
    if (!this.watchedPaths[path]) {
      depWatcher.addDependency(path, this)
      this.watchedPaths[path] = true
    }
  }

  removeDependency (path) {
    if (this.watchedPaths[path]) {
      depWatcher.removeDependency(path, this)
      delete this.watchedPaths[path]
    }
  }

  remove () {
    depWatcher.clearManager(this)
  }

  update (lastChangeTime) {
    this.lastChangeTime = lastChangeTime

    if (this.cache.watcher) {
      this.cache.watcher.refresh(this.parts)
    }
  }
}

function compileTags (inputFile, sfcDescriptor, parts, babelOptions, dependencyManager) {
  var handler = new VueComponentTagHandler({
    inputFile,
    parts,
    babelOptions,
    dependencyManager,
    sfcDescriptor,
  })

  return handler.getResults()
}

function compileOneFileWithContents (inputFile, contents, parts, babelOptions) {
  try {
    const cache = Cache.getCache(inputFile)
    const compiler = loadPackage(inputFile, 'vue-template-compiler', loadDefaultTemplateCompiler)
    const sfcDescriptor = compiler.parseComponent(contents, { pad: 'line' })

    return compileTags(inputFile, sfcDescriptor, parts, babelOptions, cache.dependencyManager)
  } catch (e) {
    if (e.message && e.line) {
      inputFile.error({
        message: e.message,
        line: e.line,
      })
      return null
    } else {
      throw e
    }
  }
}

function generateJs (vueId, inputFile, compileResult, isHotReload = false) {
  const isDev = isDevelopment()
  const inputFilePath = inputFile.getPathInPackage()

  let js = 'var __vue_script__, __vue_template__; ' + compileResult.code + '\n'
  js += `__vue_script__ = __vue_script__ || {};`
  js += `var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);`

  let render, staticRenderFns

  let templateHash
  if (compileResult.template) {
    if (!isHotReload) {
      templateHash = Hash(compileResult.template)
    }

    if (vueVersion === 1) {
      // Fix quotes
      compileResult.template = compileResult.template.replace(quoteReg, '&#39;').replace(lineReg, '')
      js += "__vue_template__ = '" + compileResult.template + "';"

      // Template option
      js += `__vue_options__.template = __vue_template__;\n`
    } else if (vueVersion === 2) {
      const compiler = loadPackage(inputFile, 'vue-template-compiler', loadDefaultTemplateCompiler)
      const templateCompilationResult = compiler.compile(compileResult.template, {
        id: vueId,
        warn: (message) => {
          const msg = `${inputFilePath}: ${message}`
          console.warn(`   (!) Warning: ${msg}`.yellow)
          if (isDev) {
            global._dev_server.emit('message', {
              type: 'warn',
              message: msg,
            })
          }
        },
      })
      if (templateCompilationResult.errors && templateCompilationResult.errors.length !== 0) {
        console.error(...templateCompilationResult.errors)
        js += `__vue_options__.render = function(){};\n`
        js += `__vue_options__.staticRenderFns = [];\n`
        if (isDev) {
          global._dev_server.emit('message', {
            type: 'error',
            message: templateCompilationResult.errors.map(e => e.toString()).join('\n'),
          })
        }
      } else {
        render = toFunction(templateCompilationResult.render)
        staticRenderFns = `[${templateCompilationResult.staticRenderFns.map(toFunction).join(',')}]`
        let renderJs = `__vue_options__.render = ${render};\n`
        renderJs += `__vue_options__.staticRenderFns = ${staticRenderFns};\n`
        const transpile = loadPackage(inputFile, 'vue-template-es2015-compiler', loadDefaultTranspiler)
        renderJs = transpile(renderJs)
        if (isDev) {
          renderJs += `__vue_options__.render._withStripped = true;\n`
        }
        js += renderJs
      }
    }

    // console.log(`template hash: ${templateHash}`)
  }

  // Scope
  if (vueVersion === 2) {
    js += `__vue_options__._scopeId = '${vueId}';`
  }

  // CSS Modules
  if (compileResult.cssModules) {
    const modules = Object.keys(compileResult.cssModules)
    const modulesCode = '__vue_options__.computed = __vue_options__.computed || {};\n' +
      modules.map(module => `__vue_options__.computed['${module}'] = function() {\n return ${compileResult.cssModules[module]}\n};\n`).join('\n')
    js += modulesCode
    // console.log(modulesCode)
  }

  // Package context
  js += `__vue_options__.packageName = '${inputFile.getPackageName()}';`

  // Auto register
  let isGlobalName = globalFileNameReg.test(inputFilePath)
  let ext = (isGlobalName ? '.global' : '') + '.vue'

  let name = Plugin.path.basename(inputFilePath)
  name = name.substring(0, name.lastIndexOf(ext))

  // Remove special characters
  name = name.replace(nonWordCharReg, match => {
    if (match !== '-') {
      return ''
    } else {
      return match
    }
  })

  // Kebab case
  name = name.replace(capitalLetterReg, (match) => {
    return '-' + match.toLowerCase()
  })
  name = name.replace(trimDashReg, '')

  // Auto default name
  js += `\n__vue_options__.name = __vue_options__.name || '${name}';`

  // Export
  js += `module.export('default', exports.default = __vue_script__);exports.__esModule = true;`

  if (!isHotReload) {
    // Hot-reloading
    if (isDev && inputFile.getArch().indexOf('web') !== -1) {
      js += `\nif(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['${vueId}'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('${vueId}', __vue_script__);
      }`
    }

    let isOutsideImports = inputFilePath.split('/').indexOf('imports') === -1
    if (isOutsideImports || isGlobalName) {
      // Component registration
      js += `\nvar _Vue = require('vue');
      _Vue.component(__vue_options__.name, __vue_script__);`
    }
  }

  return {
    js,
    templateHash,
    render,
    staticRenderFns,
  }
}

function loadPackage (inputFile, packageName, loadDefaultPackage) {
  try {
    return inputFile.require(packageName)
  } catch (err) {
    // console.log(`Unable to locally load package ${packageName}: ${err.toString().substring(0,40)}`)
    /**
     * If the user doesn't have the package installed, fallback to the one bundled with this plugin.
     **/
    return loadDefaultPackage()
  }
}
