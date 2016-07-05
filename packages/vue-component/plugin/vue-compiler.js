import fs from 'fs';
import path from 'path';
import Future from 'fibers/future';
import async from 'async';
import { Meteor } from 'meteor/meteor';

global._vue_cache = global._vue_cache || {};

VueComponentCompiler = class VueComponentCompiler extends CachingCompiler {
  constructor() {
    super({
      compilerName: 'vuecomponent',
      defaultCacheSize: 1024 * 1024 * 10,
    });

    this.babelOptions = Babel.getDefaultOptions();
  }

  processFilesForTarget(inputFiles) {
    const cacheMisses = [];

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

  isIgnored(inputFile) {
    return /node_modules/.test(inputFile.getPathInPackage())
  }

  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }

  compileResultSize(compileResult) {
    return compileResult.code.length + compileResult.map.length;
  }

  compileOneFile(inputFile) {
    const contents = inputFile.getContentsAsString();
    return this.compileOneFileWithContents(inputFile, contents);
  }

  compileOneFileWithContents(inputFile, contents) {
    const inputPath = inputFile.getPathInPackage();

    //console.log(`\nCompiling file ${inputPath}...`);

    try {
      const tags = scanHtmlForTags({
        sourceName: inputPath,
        contents: contents,
        tagNames: ['template', 'script', 'style']
      });

      return this.compileTags(inputFile, tags, this.babelOptions);
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

  addCompileResult(inputFile, compileResult) {
    let inputFilePath = inputFile.getPathInPackage();
    let hash = FileHash(inputFile);
    let vueId = inputFile.getPackageName() + ':' + inputFile.getPathInPackage();
    let isDev = Meteor.isDevelopment;

    let cached = global._vue_cache[hash] || {};

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
      // Hot-reloading
      let sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot);
      let filePath = path.resolve(sourceRoot, inputFilePath);

      // Listener
      let fileChanged = Meteor.bindEnvironment((event) => {
        if (event === 'change') {
          try {
            let cached = global._vue_cache[hash] || {};
            let contents = Plugin.fs.readFileSync(filePath, {
              encoding: 'utf8'
            });
            let compileResult = this.compileOneFileWithContents(inputFile, contents);

            // CSS
            let css = '';
            let cssHash = '';
            if (compileResult.styles.length !== 0) {
              for (let style of compileResult.styles) {
                css += style.css;
              }

              // Hot-reloading
              cssHash = Hash(css);
              if (isDev && cached.css !== cssHash) {
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
            if (cached.js !== jsHash || cached.template !== templateHash) {

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
              : __vue_script__).packageName = '${inputFile.getPackageName()}';`;

              // Export
              js += `module.export('default', exports.default = __vue_script__);`;

              let path = (inputFile.getPackageName() ? `packages/${inputFile.getPackageName()}` : '') + inputFile.getPathInPackage();

              global._dev_server.emit('js', { hash: vueId, js, template, path });
            }

            // Cache
            global._vue_cache[hash] = {
              js: jsHash,
              css: cssHash,
              template: templateHash,
              watcher
            };
          } catch (e) {
            console.error(e);
          }
        }
      });

      // Fast file change detection
      if (cached.watcher) {
        cached.watcher.close();
      }
      let watcher = fs.watch(filePath, {
        persistent: false
      }, fileChanged);
      watcher.on('error', (error) => console.log(error));

      // Cache
      global._vue_cache[hash] = {
        js: jsHash,
        css: cssHash,
        template: templateHash,
        watcher
      };
    }
  }

  compileTags(inputFile, tags, babelOptions) {
    var handler = new VueComponentTagHandler({
      inputFile,
      babelOptions
    });

    tags.forEach((tag) => {
      handler.addTagToResults(tag);
    });

    return handler.getResults();
  }

  addStylesheet(inputFile, options) {
    const data = options.data.replace(rnReg, "\n").replace(rReg, "\n");
    inputFile.addStylesheet({
      path: inputFile.getPathInPackage() + '.css',
      sourcePath: inputFile.getPathInPackage(),
      data: data,
      sourceMap: options.map
    });
  }
}

const rnReg = new RegExp("\r\n", "g");
const rReg = new RegExp("\r", "g");
const globalFileNameReg = /\.global\.vue$/;
const capitalLetterReg = /([A-Z])/g;
const trimDashReg = /^-/;
const nonWordCharReg = /\W/g;
const requireRelativeFileReg = /require\(["']\.\//ig
