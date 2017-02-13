import fs from 'fs';
import path from 'path';
import Future from 'fibers/future';
import async from 'async';
import { Meteor } from 'meteor/meteor';
import { EventEmitter } from 'events';
import _ from 'lodash';

IGNORE_FILE = '.vueignore';
CWD = path.resolve('./');


function getVueVersion() {
  const packageFile = path.join(CWD, 'package.json');

  if (fs.existsSync(packageFile)) {
    const pkg = JSON.parse(fs.readFileSync(packageFile).toString());

    const vue = pkg.dependencies && pkg.dependencies.vue
    || pkg.devDependencies && pkg.devDependencies.vue
    || pkg.peerDependencies && pkg.peerDependencies.vue;

    if(vue) {
      const reg = /\D*(\d).*/gi;
      const result = reg.exec(vue);
      if(result.length >= 2) {
        return parseInt(result[1]);
      }
    }
  }

  return 1;
}

const vueVersion = getVueVersion();

let templateCompiler, transpile;

if(vueVersion === 2) {
  const VueCompiler = require('meteor/akryum:vue-compiler').default
  templateCompiler = VueCompiler.compile;
  transpile = VueCompiler.transpile;
}

function toFunction (code) {
  return 'function (){' + code + '}';
}

// Cache
global._vue_cache = global._vue_cache || {};

const babelOptions = Babel.getDefaultOptions();

// Compiler
VueComponentCompiler = class VueCompo extends CachingCompiler {
  constructor() {
    super({
      compilerName: 'vuecomponent',
      defaultCacheSize: 1024 * 1024 * 10,
    });
  }

  processFilesForTarget(inputFiles) {
    const cacheMisses = [];

    this.updateIgnoredConfig(inputFiles);

    //console.log(`Found ${inputFiles.length} files.`);

    const future = new Future;
    async.eachLimit(inputFiles, this._maxParallelism, (inputFile, cb) => {
      if(!this.isIgnored(inputFile)) {
        let error = null;
        try {
          const cacheKey = this._deepHash(this.getCacheKey(inputFile));
          let compileResult = this._cache.get(cacheKey);

          if (!compileResult) {
            compileResult = this._readCache(cacheKey);
            if (compileResult) {
              this._cacheDebug(`Loaded ${ inputFile.getDisplayPath() }`);
            }
          }

          if (!compileResult) {
            cacheMisses.push(inputFile.getDisplayPath());
            compileResult = this.compileOneFile(inputFile);

            if (!compileResult) {
              // compileOneFile should have called inputFile.error.
              //  We don't cache failures for now.
              return;
            }

            // Save what we've compiled.
            this._cache.set(cacheKey, compileResult);
            this._writeCacheAsync(cacheKey, compileResult);
          }

          this.addCompileResult(inputFile, compileResult);
        } catch (e) {
          error = e;
        } finally {
          cb(error);
        }
      } else {
        cb();
      }
    }, future.resolver());
    future.wait();

    if (this._cacheDebugEnabled) {
      cacheMisses.sort();
      this._cacheDebug(
        `Ran (#${ ++this._callCount }) on: ${ JSON.stringify(cacheMisses) }`);
    }
  }

  updateIgnoredConfig(inputFiles) {
    this.ignoreRules = [];
    for(let inputFile of inputFiles) {
      if(inputFile.getBasename() === IGNORE_FILE) {
        const contents = normalizeCarriageReturns(inputFile.getContentsAsString());
        const lines = contents.split('\n');
        let dirname = getFullDirname(inputFile);
        if(dirname === '.') {
          dirname = '';
        }
        for(let line of lines) {
          if(line !== '') {
            this.ignoreRules.push({
              dirname,
              reg: new RegExp(line),
            });
          }
        }
      }
    }
  }

  isIgnored(inputFile) {
    if(inputFile.getBasename() === IGNORE_FILE) {
      return true;
    }

    for(let rule of this.ignoreRules) {
      const dirname = getFullDirname(inputFile);
      if(dirname.indexOf(rule.dirname) === 0 && rule.reg.test(inputFile.getPathInPackage())) {
        return true;
      }
    }
    return false;
  }

  getCacheKey(inputFile) {
    let cache = Cache.getCache(inputFile);
    return inputFile.getSourceHash() + '_' + cache.dependencyManager.lastChangeTime;
  }

  compileResultSize(compileResult) {
    return compileResult.code.length + compileResult.map.length;
  }

  compileOneFile(inputFile) {
    const contents = inputFile.getContentsAsString();
    return compileOneFileWithContents(inputFile, contents, {
      template: true,
      script: true,
      style: true,
    }, babelOptions);
  }

  addCompileResult(inputFile, compileResult) {
    const inputFilePath = inputFile.getPathInPackage();
    const vueId = 'data-v-' + FileHash(inputFile);
    const isDev = isDevelopment();

    let jsHash = Hash(compileResult.code);

    //console.log(`js hash: ${jsHash}`);

    const { js, templateHash } = generateJs(vueId, inputFile, compileResult)

    // Add JS Source file
    inputFile.addJavaScript({
      path: inputFile.getPathInPackage(),
      data: js,
      sourceMap: compileResult.map,
      lazy: true,
    });

    // Style
    let css = '';
    let cssHash = '';
    if (compileResult.styles.length !== 0) {
      for (let style of compileResult.styles) {
        css += style.css;
      }

      cssHash = Hash(css);

      //console.log(`css hash: ${cssHash}`);

      if (isDev) {
        // Add style to client first-connection style list
        global._dev_server.__addStyle({ hash: vueId, css, path: inputFilePath }, false);
      } else {
        this.addStylesheet(inputFile, {
          data: css
        });
      }
    }

    if (isDev) {
      cache = Cache.getCache(inputFile);
      cache.watcher.update(inputFile);
      cache.filePath = getFilePath(inputFile);
      cache.js = jsHash;
      cache.css = cssHash;
      cache.template = templateHash;
    }
  }

  addStylesheet(inputFile, options) {
    const data = normalizeCarriageReturns(options.data);
    inputFile.addStylesheet({
      path: inputFile.getPathInPackage(),
      sourcePath: inputFile.getPathInPackage(),
      data: data,
      sourceMap: options.map,
      lazy: false,
    });
  }
}

class Cache {
  static getCacheKey(inputFile) {
    return FileHash(inputFile);
  }

  static getCache(inputFile) {
    const key = Cache.getCacheKey(inputFile);
    let result = global._vue_cache[key] || null;
    if(result === null) {
      result = global._vue_cache[key] = Cache.createCache(key, inputFile);
    }
    return result;
  }

  static createCache(key, inputFile) {
    const cache = {
      key,
      js: null,
      css: null,
      template: null,
      watcher: null,
      dependencyManager: null,
      filePath: getFullPathInApp(inputFile),
    };

    if(isDevelopment()) {
      cache.watcher = new ComponentWatcher(cache);
    }

    cache.dependencyManager = new DependencyManager('style', cache);

    return cache;
  }

  static removeCache(key) {
    const cache = global._vue_cache[key];
    if(cache) {
      cache.watcher.remove();
      cache.dependencyManager.remove();
    }
    delete global._vue_cache[key];
  }

  static cleanCache(keptInputFiles) {
    // TODO

    const keptKeys = [];

    for(let key in global._vue_cache) {

    }
  }
}

class ComponentWatcher {
  constructor(cache) {
    this.cache = cache;
  }

  update(inputFile) {
    this.inputFile = inputFile;
    const filePath = getFilePath(this.inputFile);
    this._watchPath(filePath);
  }

  refresh(parts) {
    if(!parts) {
      parts = {
        template: true,
        script: true,
        style: true,
      };
    }
    try {
      hotCompile(this.filePath, this.inputFile, this.cache, parts);
    } catch (e) {
      console.error(e);
    }
  }

  remove() {
    this._closeWatcher();
  }

  _closeWatcher() {
    if (this.watcher) {
      this.watcher.close();
    }
  }

  _watchPath(filePath) {
    if(!this.watcher || filePath !== this.filePath) {
      this.filePath = filePath;
      // Fast file change detection
      this._closeWatcher();
      this.watcher = fs.watch(filePath, {
        persistent: false
      }, _.debounce(event => {
        if (event === 'change') {
          this.refresh();
        }
      }, 100, {
        leading: true,
        trailing: false
      }));
      this.watcher.on('error', (error) => console.error(error));
    }
  }
}

const hotCompile = Meteor.bindEnvironment(function hotCompile(filePath, inputFile, cache, parts) {
  let inputFilePath = inputFile.getPathInPackage();
  let contents = Plugin.fs.readFileSync(filePath, {
    encoding: 'utf8'
  });
  let compileResult = compileOneFileWithContents(inputFile, contents, parts, babelOptions);
  let vueId = 'data-v-' + FileHash(inputFile);

  // CSS
  let css = '', cssHash = '';
  if(parts.style) {
    if (compileResult.styles.length !== 0) {
      for (let style of compileResult.styles) {
        css += style.css;
      }

      // Hot-reloading
      cssHash = Hash(css);
      if (cache.css !== cssHash) {
        global._dev_server.__addStyle({ hash: vueId, css, path: inputFilePath });
      }
    }
  }

  // JS & Template
  let jsHash, template, templateHash;
  if(parts.script || parts.template) {
    if(parts.script) {
      jsHash = Hash(compileResult.code);
    }
    if(parts.template) {
      template = compileResult.template;
      templateHash;
      if (template) {
        templateHash = Hash(template);
      } else {
        templateHash = cache.template;
      }
    }

    if (cache.js !== jsHash || cache.template !== templateHash) {

      const path = (inputFile.getPackageName() ? `packages/${inputFile.getPackageName()}` : '') + inputFile.getPathInPackage();

      const { js, render, staticRenderFns } = generateJs(vueId, inputFile, compileResult, true)

      if(vueVersion === 2 && cache.js === jsHash) {
        global._dev_server.emit('render', { hash: vueId, template:`{
          render: ${render},
          staticRenderFns: ${staticRenderFns}
        }`, path });
      } else {
        global._dev_server.emit('js', { hash: vueId, js, template, path });
      }
    }
  }

  // Cache
  if(parts.script) {
    cache.js = jsHash;
  }
  if(parts.style) {
    cache.css = cssHash;
  }
  if(parts.template) {
    cache.template = templateHash;
  }
});

class DependencyWatcher {
  constructor() {
    this.files = {};
  }

  clearManager(manager) {
    for(let path in this.files) {
      this.removeDependency(path, manager);
    }
  }

  addDependency(path, manager) {
    let file = this.files[path];

    if(!file) {
      file = this.files[path] = {
        path,
        lastChangeTime: 0,
        managers: [manager],
        watcher: null
      };

      file.watcher = fs.watch(path, {
        persistent: false
      }, _.debounce(_ => this._fileChanged(file), 100, {
        leading: true,
        trailing: false
      }));
    } else {
      file.managers.push(manager);
    }
  }

  removeDependency(path, manager) {
    const file = this.files[path];
    _.pull(file.managers, manager);
    if(file.managers.length = 0) {
      this.removeFile(file);
    }
  }

  removeFile(file) {
    if(file.watcher) {
      file.watcher.close();
    }
    delete this.files[file.path];
  }

  _fileChanged(file) {
    const lastChangeTime = file.lastChangeTime = new Date().getTime();
    for(let manager of file.managers) {
      manager.update(lastChangeTime);
    }
  }
}

const depWatcher = global.__vue_dep_watcher = global.__vue_dep_watcher || new DependencyWatcher();

class DependencyManager {
  constructor(type, cache) {
    this.type = type;
    this.cache = cache;
    this.lastChangeTime = 0;

    this.parts = {
      template: false,
      script: false,
      style: false,
    };
    this.parts[this.type] = true;

    this.watchedPaths = {};
  }

  addDependency(path) {
    if(!this.watchedPaths[path]) {
      depWatcher.addDependency(path, this);
      this.watchedPaths[path] = true;
    }
  }

  removeDependency(path) {
    if(this.watchedPaths[path]) {
      depWatcher.removeDependency(path, this);
      delete this.watchedPaths[path];
    }
  }

  remove() {
    depWatcher.clearManager(this);
  }

  update(lastChangeTime) {
    this.lastChangeTime = lastChangeTime;

    if(this.cache.watcher) {
      this.cache.watcher.refresh(this.parts);
    }
  }
}

function compileTags(inputFile, tags, parts, babelOptions, dependencyManager) {
  var handler = new VueComponentTagHandler({
    inputFile,
    parts,
    babelOptions,
    dependencyManager
  });

  tags.forEach((tag) => {
    handler.addTagToResults(tag);
  });

  return handler.getResults();
}

function compileOneFileWithContents(inputFile, contents, parts, babelOptions) {
  const inputPath = inputFile.getPathInPackage();

  try {
    const cache = Cache.getCache(inputFile);

    const tags = scanHtmlForTags({
      sourceName: inputPath,
      contents: contents,
      tagNames: ['template', 'script', 'style']
    });

    return compileTags(inputFile, tags, parts, babelOptions, cache.dependencyManager);
  } catch (e) {
    if (e.message && e.line) {
      inputFile.error({
        message: e.message,
        line: e.line
      });
      return null;
    } else {
      throw e;
    }
  }
}

function generateJs (vueId, inputFile, compileResult, isHotReload = false) {
  const isDev = isDevelopment();
  const inputFilePath = inputFile.getPathInPackage();

  let js = 'var __vue_script__, __vue_template__;' + compileResult.code;
  js += `__vue_script__ = __vue_script__ || {};`;
  js += `var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);`;

  let render, staticRenderFns;

  let templateHash;
  if (compileResult.template) {

    if (!isHotReload) {
      templateHash = Hash(compileResult.template);
    }

    if(vueVersion === 1) {
      // Fix quotes
      compileResult.template = compileResult.template.replace(quoteReg, '&#39;').replace(lineReg, '');
      js += "__vue_template__ = '" + compileResult.template + "';";

      // Template option
      js += `__vue_options__.template = __vue_template__;\n`;
    } else if(vueVersion === 2) {
      const templateCompilationResult = templateCompiler.compile(compileResult.template);
      if(templateCompilationResult.errors && templateCompilationResult.errors.length !== 0) {
        console.error(templateCompilationResult.errors);
        js += `__vue_options__.render = function(){};\n`;
        js += `__vue_options__.staticRenderFns = [];\n`;
      } else {
        render = toFunction(templateCompilationResult.render)
        staticRenderFns = `[${ templateCompilationResult.staticRenderFns.map(toFunction).join(',')}]`
        let renderJs = `__vue_options__.render = ${render};\n`;
        renderJs += `__vue_options__.staticRenderFns = ${staticRenderFns};\n`;
        renderJs = transpile(renderJs);
        if (isDev) {
          renderJs += `__vue_options__.render._withStripped = true;\n`
        }
        js += renderJs;
      }
    }

    //console.log(`template hash: ${templateHash}`);
  }

  // Scope
  if(vueVersion === 2) {
    js += `__vue_options__._scopeId = '${vueId}';`;
  }

  // CSS Modules
  if(compileResult.cssModules) {
    console.log('adding css modules', JSON.stringify(compileResult.cssModules))
    const modulesCode = `__vue_options__.computed = {\n $style: function() {\n return ${JSON.stringify(compileResult.cssModules)}\n }\n};\n`;
    js += modulesCode;
    console.log(modulesCode)
  }

  // Package context
  js += `__vue_options__.packageName = '${inputFile.getPackageName()}';`;

  // Export
  js += `module.export('default', exports.default = __vue_script__);`;

  if (!isHotReload) {
    // Hot-reloading
    if (isDev) {
      js += `\nif(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['${vueId}'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('${vueId}', __vue_script__);
      }`;
    }

    // Auto register
    let isGlobalName = globalFileNameReg.test(inputFilePath);
    let ext = (isGlobalName ? '.global' : '') + '.vue';

    let name = Plugin.path.basename(inputFilePath);
    name = name.substring(0, name.lastIndexOf(ext));

    // Remove special characters
    name = name.replace(nonWordCharReg, match => {
      if (match !== '-') {
        return ''
      } else {
        return match
      }
    });

    // Kebab case
    name = name.replace(capitalLetterReg, (match) => {
      return '-' + match.toLowerCase();
    });
    name = name.replace(trimDashReg, '');

    // Auto default name
    js += `\n__vue_options__.name = __vue_options__.name || '${name}';`
    let isOutsideImports = inputFilePath.split('/').indexOf('imports') === -1;
    if (isOutsideImports || isGlobalName) {
      // Component registration
      js += `\nvar _Vue = require('vue');
      _Vue.component(__vue_options__.name, __vue_script__);`;
    }
  }

  return {
    js,
    templateHash,
    render,
    staticRenderFns,
  }
}
