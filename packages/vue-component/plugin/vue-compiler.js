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

      if(isDev) {
        // Add style to client first-connection style list
        global._dev_server.__addStyle({hash: vueId, css}, false);
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
    if(compileResult.template) {
      js += "__vue_template__ = '" + compileResult.template + "';";
      templateHash = Hash(compileResult.template);

      //console.log(`template hash: ${templateHash}`);
    }

    // Template option & Export
    js += `__vue_script__ = __vue_script__ || {};
    if(__vue_template__) {
      (typeof __vue_script__ === "function" ?
      (__vue_script__.options || (__vue_script__.options = {}))
      : __vue_script__).template = __vue_template__;
    }
    module.export('default', function(){return __vue_script__;})`;

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

    if(isDev) {
      // Hot-reloading
      let filePath = path.resolve(inputFilePath);

      // Listener
      let fileChanged = Meteor.bindEnvironment((event) => {
        if(event === 'change') {
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
              if(isDev && cached.css !== cssHash) {
                global._dev_server.__addStyle({hash: vueId, css});
              }
            }

            // JS & Template
            let js = compileResult.code;
            let jsHash = Hash(js);
            let template = compileResult.template;
            let templateHash;
            if(template) {
              templateHash = Hash(template);
            }
            if(cached.js !== jsHash || cached.template !== templateHash) {

              // Require to absolute
              js = js.replace(requireRelativeFileReg, `require('/${inputFilePath}/`);

              js = 'var __vue_script__, __vue_template__;' + js;

              if(template) {
                js += "__vue_template__ = '" + template + "';";
              }

              // Template option & Export
              js += `__vue_script__ = __vue_script__ || {};
              if(__vue_template__) {
                (typeof __vue_script__ === "function" ?
                (__vue_script__.options || (__vue_script__.options = {}))
                : __vue_script__).template = __vue_template__;
              }
              module.export('default', function(){return __vue_script__;})`;

              global._dev_server.emit('js', {hash: vueId, js, template});
            }

            // Cache
            global._vue_cache[hash] = {
              js: jsHash,
              css: cssHash,
              template: templateHash,
              watcher
            };
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
const requireRelativeFileReg = /require\(["']\.\//ig
