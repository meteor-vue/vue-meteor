import fs from 'fs';
import path from 'path';
import Future from 'fibers/future';
import async from 'async';
import { Meteor } from 'meteor/meteor';
import { EventEmitter } from 'events';
import _ from 'lodash';

IGNORE_FILE = '.vueignore';

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
    return compileOneFileWithContents(inputFile, contents, babelOptions);
  }

  addCompileResult(inputFile, compileResult) {
    let inputFilePath = inputFile.getPathInPackage();
    let vueId = inputFile.getPackageName() + ':' + inputFile.getPathInPackage();
    let isDev = isDevelopment();

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
        global._dev_server.__addStyle({ hash: vueId, css }, false);
      } else {
        this.addStylesheet(inputFile, {
          data: css
        });
      }
    }

    let js = compileResult.code;
    let jsHash = Hash(js);

    //console.log(`js hash: ${jsHash}`);

    js = 'var __vue_script__, __vue_template__;' + js;

    let templateHash;
    if (compileResult.template) {
      js += "__vue_template__ = '" + compileResult.template + "';";
      templateHash = Hash(compileResult.template);

      //console.log(`template hash: ${templateHash}`);
    }

    // Template option
    js += `__vue_script__ = __vue_script__ || {};
    if(__vue_template__) {
      (typeof __vue_script__ === "function" ?
      (__vue_script__.options || (__vue_script__.options = {}))
      : __vue_script__).template = __vue_template__;
    }`;

    // Package context
    js += `(typeof __vue_script__ === "function" ?
    (__vue_script__.options || (__vue_script__.options = {}))
    : __vue_script__).packageName = '${inputFile.getPackageName()}';`;

    // Export
    js += `module.export('default', exports.default = __vue_script__);`;

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
    let isOutsideImports = inputFilePath.split('/').indexOf('imports') === -1;
    if (isOutsideImports || isGlobalName) {
      let ext = (isGlobalName ? '.global' : '') + '.vue';

      let name = Plugin.path.basename(inputFilePath);
      name = name.substring(0, name.lastIndexOf(ext));

      // Remove special characters
      name = name.replace(nonWordCharReg, '');

      // Kebab case
      name = name.replace(capitalLetterReg, (match) => {
        return '-' + match.toLowerCase();
      });
      name = name.replace(trimDashReg, '');

      // Component registration
      js += `\nvar _akryumVue = require('meteor/akryum:vue');
      _akryumVue.Vue.component((typeof __vue_script__ === "function" ?
      (__vue_script__.options || (__vue_script__.options = {}))
      : __vue_script__).name || '${name}', __vue_script__);`;
    }

    // Add JS Source file
    inputFile.addJavaScript({
      path: inputFile.getPathInPackage() + '.js',
      sourcePath: inputFile.getPathInPackage(),
      data: js,
      sourceMap: compileResult.map
    });

    if (isDev) {
      let cache = Cache.getCache(inputFile);
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
      path: inputFile.getPathInPackage() + '.css',
      sourcePath: inputFile.getPathInPackage(),
      data: data,
      sourceMap: options.map
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
    };

    if(isDevelopment()) {
      cache.watcher = new ComponentWatcher(cache);
    }

    cache.dependencyManager = new DependencyManager(cache);

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

    // Listener
    this._fileChanged = _.debounce(Meteor.bindEnvironment((event) => {
      if (event === 'change') {
        try {
          let inputFilePath = this.inputFile.getPathInPackage();
          let vueId = this.inputFile.getPackageName() + ':' + this.inputFile.getPathInPackage();
          let contents = Plugin.fs.readFileSync(this.filePath, {
            encoding: 'utf8'
          });
          let compileResult = compileOneFileWithContents(this.inputFile, contents, babelOptions);

          // CSS
          let css = '';
          let cssHash = '';
          if (compileResult.styles.length !== 0) {
            for (let style of compileResult.styles) {
              css += style.css;
            }

            // Hot-reloading
            cssHash = Hash(css);
            if (this.cache.css !== cssHash) {
              global._dev_server.__addStyle({ hash: vueId, css });
            }
          }

          // JS & Template
          let js = compileResult.code;
          let jsHash = Hash(js);
          let template = compileResult.template;
          let templateHash;
          if (template) {
            templateHash = Hash(template);
          }
          if (this.cache.js !== jsHash || this.cache.template !== templateHash) {

            // Require to absolute
            js = js.replace(requireRelativeFileReg, `require('/${inputFilePath}/`);

            js = 'var __vue_script__, __vue_template__;' + js;

            if (template) {
              js += "__vue_template__ = '" + template + "';";
            }

            // Template option & Export
            js += `__vue_script__ = __vue_script__ || {};
            if(__vue_template__) {
              (typeof __vue_script__ === "function" ?
              (__vue_script__.options || (__vue_script__.options = {}))
              : __vue_script__).template = __vue_template__;
            }`;

            // Package context
            js += `(typeof __vue_script__ === "function" ?
            (__vue_script__.options || (__vue_script__.options = {}))
            : __vue_script__).packageName = '${this.inputFile.getPackageName()}';`;

            // Export
            js += `module.export('default', exports.default = __vue_script__);`;

            let path = (this.inputFile.getPackageName() ? `packages/${this.inputFile.getPackageName()}` : '') + this.inputFile.getPathInPackage();

            global._dev_server.emit('js', { hash: vueId, js, template, path });
          }

          // Cache
          this.cache.js = jsHash;
          this.cache.css = cssHash;
          this.cache.template = templateHash;
        } catch (e) {
          console.error(e);
        }
      }
    }), 100, {
      leading: true,
      trailing: false
    });
  }

  update(inputFile) {
    this.inputFile = inputFile;
    const filePath = getFilePath(this.inputFile);
    this._watchPath(filePath);
  }

  refresh() {
    this._fileChanged('change');
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
      // Fast file change detection
      this._closeWatcher();
      this.watcher = fs.watch(filePath, {
        persistent: false
      }, this._fileChanged);
      this.watcher.on('error', (error) => console.error(error));
    }
    this.filePath = filePath;
  }
}

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
  constructor(cache) {
    this.cache = cache;
    this.lastChangeTime = 0;
  }

  addDependency(path) {
    depWatcher.addDependency(path, this);
  }

  removeDependency(path) {
    depWatcher.removeDependency(path, this);
  }

  remove() {
    depWatcher.clearManager(this);
  }

  update(lastChangeTime) {
    this.lastChangeTime = lastChangeTime;

    if(this.cache.watcher) {
      this.cache.watcher.refresh();
    }
  }
}

function normalizeCarriageReturns(contents) {
  return contents.replace(rnReg, "\n").replace(rReg, "\n");
}

function getFullDirname(inputFile) {
  const packageName = inputFile.getPackageName();
  return (packageName? packageName + '/' : '') + inputFile.getDirname();
}

function getFullPathInApp(inputFile) {
  const packageName = inputFile.getPackageName();
  return (packageName? packageName + '/' : '') + inputFile.getPathInPackage();
}

function getFilePath(inputFile) {
  const sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot);
  return path.resolve(sourceRoot, inputFile.getPathInPackage());
}

function isDevelopment() {
  return Meteor.isDevelopment;
}

function compileTags(inputFile, tags, babelOptions, dependencyManager) {
  var handler = new VueComponentTagHandler({
    inputFile,
    babelOptions,
    dependencyManager
  });

  tags.forEach((tag) => {
    handler.addTagToResults(tag);
  });

  return handler.getResults();
}

function compileOneFileWithContents(inputFile, contents, babelOptions) {
  const inputPath = inputFile.getPathInPackage();

  try {
    const cache = Cache.getCache(inputFile);

    const tags = scanHtmlForTags({
      sourceName: inputPath,
      contents: contents,
      tagNames: ['template', 'script', 'style']
    });

    return compileTags(inputFile, tags, babelOptions, cache.dependencyManager);
  } catch (e) {
    if (e instanceof CompileError) {
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

const rnReg = new RegExp("\r\n", "g");
const rReg = new RegExp("\r", "g");
const globalFileNameReg = /\.global\.vue$/;
const capitalLetterReg = /([A-Z])/g;
const trimDashReg = /^-/;
const nonWordCharReg = /\W/g;
const requireRelativeFileReg = /require\(["']\.\//ig
