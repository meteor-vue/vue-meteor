import path from 'path';
import fs from 'fs';
import _ from 'lodash';

global._vue_i18n_cache_ = global._vue_i18n_cache_ || {};

function isHot() {
  return global._dev_server_http && global._dev_server;
}

Plugin.registerCompiler({
  extensions: ['i18n.json'],
  filenames: ['langs.json'],
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
        packageName = packageName.replace(packageNameCharsReg, '_');
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

  watchFile(id, inputFile, context, callback) {
    let cache = this.cache[id];
    if(cache.watcher) {
      cache.watcher.close();
    }

    let sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot);
    let filePath = path.resolve(sourceRoot, inputFile.getPathInPackage());

    context.filePath = filePath;

    callback = callback.bind(context);

    let watcher = fs.watch(filePath, {
      persistent: false
    }, (function(event) {
      if(event === 'change') {
        let contents = Plugin.fs.readFileSync(this.filePath, {
          encoding: 'utf8'
        });
        if(this.contents !== contents) {
          this.contents = contents;
          callback(contents);
        }
      }
    }).bind(context));
    watcher.on('error', (error) => console.log(error));
    cache.watcher = watcher;
  }

  processFilesForTarget(files) {
    if(files.length === 0){
      throw new Error('You must add at last one lang file in your client code (ex: app.en.i18n.json).');
    }
    let firstFile = null;

    let langFiles = {};
    let langs = [];
    let manualLangs = false;
    this.cache = global._vue_i18n_cache_;

    // Add files to languages
    for(let inputFile of files) {
      let inputFilePath = inputFile.getPathInPackage();
      let packageName = inputFile.getPackageName();
      let sourcePath = packageName ? "/packages/" + packageName + "/" + inputFilePath : "/" + inputFilePath;
      let id = sourcePath;

      let isLangsFile = (inputFile.getBasename() === 'langs.json');
      if(isLangsFile) {
        id = '__langs__';
      }

      let cache = this.cache[id] = this.cache[id] || {};
      // TODO caching?

      //console.log(inputFile.getBasename());
      if(isLangsFile) {
        // Lang list
        manualLangs = true;
        langs = JSON.parse(inputFile.getContentsAsString());

        // Hot-reloading
        if(isHot()) {
          let compiler = this;
          this.watchFile(id, inputFile, {}, function(contents) {
            global._dev_server.emit('langs.updated', {
              langs
            });
          });
        }
      } else {
        // Locale file

        if(!firstFile && !packageName) {
          firstFile = inputFile;
        }

        let lang = inputFile.getBasename().split(".").slice(0, -2).pop();

        if(lang === null || typeof lang === 'undefined') {
          throw new Error('Missing lang tag in filename (ex: app.en.i18n.json):' + sourcePath);
        }

        if(!langFiles[lang]) {
          langFiles[lang] = {
            hasAppLocale: false,
            files: []
          };
        }
        let fileList = langFiles[lang];
        let handler = {
          inputFile,
          updatedSource: null
        };
        fileList.files.push(handler);

        if(!inputFile.getPackageName()) {
          fileList.hasAppLocale = true;
        }

        // Hot-reloading
        if(isHot()) {
          let compiler = this;
          this.watchFile(id, inputFile, {
            lang,
            handler,
            fileList
          }, function(contents) {
            this.handler.updatedSource = contents;
            let data = compiler.generateLocale(this.fileList.files);

            global._dev_server.emit('lang.updated', {
              lang: this.lang,
              data
            });
          });
        }
      }
    }

    if(!firstFile) {
      throw new Error('You must add at last one lang file in your client code (ex: app.en.i18n.json).');
    }

    // Generate merged asset for each language
    for(let lang in langFiles) {
      if(!manualLangs || langs.indexOf(lang) !== -1) {
        let fileList = langFiles[lang];
        if(fileList.hasAppLocale) {
          let data = this.generateLocale(fileList.files);

          firstFile.addAsset({
            path: `i18n/${lang}.json`,
            data: JSON.stringify(data),
            lazy: true
          });

          if(!manualLangs) {
            langs.push(lang);
          }
        }
      }
    }

    let langsJson = JSON.stringify(langs);
    firstFile.addAsset({
      path: 'i18n/__langs.json',
      data: langsJson
    });
  }
}

const packageNameCharsReg = /:|-/g;
