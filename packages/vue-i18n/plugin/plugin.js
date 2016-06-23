import path from 'path';
import fs from 'fs';
import _ from 'lodash';

Plugin.registerCompiler({
  extensions: ['i18n.json'],
}, () => new VueI18nCompiler());

class VueI18nCompiler {
  processFilesForTarget(files) {
    if(files.length === 0){
      throw new Error('You must add at last one lang file in your client code (ex: app.en.i18n.json).');
    }
    let firstFile = files[0];

    let langFiles = {};
    let langs = [];

    // Add files to languages
    for(let inputFile of files) {
      let inputFilePath = inputFile.getPathInPackage();

      let lang = path.basename(inputFilePath).split(".").slice(0, -2).pop();

      if(lang === null || typeof lang === 'undefined') {
        let packageName = inputFile.getPackageName();
        let sourcePath = packageName ? "/packages/" + packageName + "/" + inputFilePath : "/" + inputFilePath;
        throw new Error('Missing lang tag in filename (ex: app.en.i18n.json):' + sourcePath);
      }

      if(!langFiles[lang]) {
        langFiles[lang] = [];
      }
      let fileList = langFiles[lang];
      fileList.push(inputFile);
    }

    // Generate merged asset for each language
    for(let lang in langFiles) {
      let data = {};
      for(let inputFile of langFiles[lang]) {
        let packageName = inputFile.getPackageName();
        let contents = JSON.parse(inputFile.getContentsAsString());
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

      firstFile.addAsset({
        path: `i18n/${lang}.json`,
        data: JSON.stringify(data)
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
