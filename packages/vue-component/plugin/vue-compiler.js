import fs from 'fs';
import path from 'path';
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
    let isDev = (process.env.NODE_ENV === 'development');

    let cached = global._vue_cache[hash] || {};

    // Style
    let css = '';
    let cssHash = '';
    if (compileResult.styles.length !== 0) {
      for (let style of compileResult.styles) {
        css += style.css;
      }

      this.addStylesheet(inputFile, {
        data: css
      });
    }

    let js = compileResult.code;

    // Hot-reloading
    if (isDev) {
      js += `\nwindow.__vue_hot__.createRecord('${vueId}', exports.default);`;
    }

    // Auto register
    if (globalFileNameReg.test(inputFilePath)) {

      let name = Plugin.path.basename(inputFilePath);
      name = name.substring(0, name.lastIndexOf('.global.vue'));

      // Remove special characters
      name = name.replace(nonWordCharReg, '');

      // Kebab case
      name = name.replace(capitalLetterReg, (match) => {
        return '-' + match.toLowerCase();
      });
      name = name.replace(trimDashReg, '');

      js += `\nvar _akryumVue = require('meteor/akryum:vue');
      _akryumVue.Vue.component((typeof __vue_script__ === "function" ?
      (__vue_script__.options || (__vue_script__.options = {}))
      : __vue_script__).name || '${name}', __vue_script__);`;
    }

    inputFile.addJavaScript({
      path: inputFile.getPathInPackage() + '.js',
      sourcePath: inputFile.getPathInPackage(),
      data: js,
      sourceMap: compileResult.map
    });

    if(isDev) {
      // Hot-reloading
      let filePath = path.resolve(inputFilePath);

      // Listener
      let fileChanged = Meteor.bindEnvironment((event) => {
        if(event === 'change') {
          try {
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
              if(isDev && cached.css !== cssHash) {
                global._dev_server.emit('css', {hash: vueId, css});
              }
            }

            // JS
            let js = compileResult.code;
            let jsHash = Hash(js);
            if(cached.js !== jsHash) {
              global._dev_server.emit('js', {hash: vueId, js});
            }
          }catch(e) {
            console.error(e);
          }
        }
      });

      // Fast file change detection
      if(cached.watcher) {
        cached.watcher.close();
      }
      let watcher = fs.watch(filePath, {
        persistent: false
      }, fileChanged);

      // Cache
      global._vue_cache[hash] = {
        js: jsHash,
        css: cssHash,
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
    const data = options.data.replace(new RegExp("\r\n", "g"), "\n").replace(new RegExp("\r", "g"), "\n");
    inputFile.addStylesheet({
      path: inputFile.getPathInPackage() + '.css',
      sourcePath: inputFile.getPathInPackage(),
      data: data,
      sourceMap: options.map
    });
  }
}

const globalFileNameReg = /\.global\.vue$/;
const capitalLetterReg = /([A-Z])/g;
const trimDashReg = /^-/;
const nonWordCharReg = /\W/g;
