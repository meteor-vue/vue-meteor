import path from 'path';
import fs from 'fs';
import _ from 'lodash';

global._vue_i18n_cache_ = global._vue_i18n_cache_ || {};

function isHot() {
  return global._dev_server_http && global._dev_server;
}

Plugin.registerCompiler({
  extensions: ['i18n.json'],
  archMatching: 'web'
}, () => new VueI18nCompiler());

class VueI18nCompiler {
  generateLocale(files) {
    let data = {};
    for(let handler of files) {
      let {inputFile, updatedSource} = handler;
      let packageName = inputFile.getPackageName();
      let contents = JSON.parse(updatedSource || inputFile.getContentsAsString());
      if(packageName) {
        if(!data.packages) {
          data.packages = {};
        }
        if(!data.packages[packageName]) {
          data.packages[packageName] = contents;
        } else {
          _.merge(data.packages[packageName], contents);
        }
      } else {
        _.merge(data, contents)
      }
    }
    return data;
  }

  processFilesForTarget(files) {
    if(files.length === 0){
      throw new Error('You must add at last one lang file in your client code (ex: app.en.i18n.json).');
    }
    let firstFile = files[0];

    let langFiles = {};
    let langs = [];
    this.watchers = global._vue_i18n_cache_;

    // Add files to languages
    for(let inputFile of files) {
      let inputFilePath = inputFile.getPathInPackage();
      let packageName = inputFile.getPackageName();
      let sourcePath = packageName ? "/packages/" + packageName + "/" + inputFilePath : "/" + inputFilePath;

      let lang = path.basename(inputFilePath).split(".").slice(0, -2).pop();

      if(lang === null || typeof lang === 'undefined') {
        throw new Error('Missing lang tag in filename (ex: app.en.i18n.json):' + sourcePath);
      }

      if(!langFiles[lang]) {
        langFiles[lang] = [];
      }
      let fileList = langFiles[lang];
      let handler = {
        inputFile,
        updatedSource: null
      };
      fileList.push(handler);

      // Hot-reloading
      if(isHot()) {
        if(this.watchers[sourcePath]) {
          this.watchers[sourcePath].close();
        }

        let sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot);
        let filePath = path.resolve(sourceRoot, inputFilePath);
        let context = {
          lang,
          filePath,
          handler,
          fileList,
          contents: null
        };

        let compiler = this;
        let watcher = fs.watch(filePath, {
          persistent: false
        }, (function(event) {
          if(event === 'change') {
            let contents = Plugin.fs.readFileSync(this.filePath, {
              encoding: 'utf8'
            });
            if(this.contents !== contents) {
              this.contents = this.handler.updatedSource = contents;
              let data = compiler.generateLocale(this.fileList);

              global._dev_server.emit('lang.updated', {
                lang: this.lang,
                data
              });
            }
          }
        }).bind(context));
        this.watchers[sourcePath] = watcher;
      }
    }

    // Generate merged asset for each language
    for(let lang in langFiles) {
      let data = this.generateLocale(langFiles[lang]);

      firstFile.addAsset({
        path: `i18n/${lang}.json`,
        data: JSON.stringify(data),
        lazy: true
      });

      langs.push(lang);
    }

    let langsJson = JSON.stringify(langs);
    firstFile.addAsset({
      path: 'i18n/__langs.json',
      data: langsJson
    });
  }
}
