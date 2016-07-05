global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

import path from 'path';
import fs from 'fs';
import stylus from 'stylus';
import nib from 'nib';
import { Meteor } from 'meteor/meteor';

function statOrNull(path) {
  try {
    return fs.statSync(path);
  } catch (e) {
    return null;
  }
}

global.vue.lang.stylus = Meteor.wrapAsync(function({
  source,
  inputFile
}, cb) {

  function parseImportPath(filePath, importerDir) {
    let resolvedFilename;
    if (filePath.indexOf('~') === 0) {
      resolvedFilename = filePath.substr(1);
      /*} else if (filename.indexOf('{') === 0) {
        resolvedFilename = decodeFilePath(filename);*/
    } else {
      let currentDirectory = path.dirname(inputFile.getPathInPackage());
      resolvedFilename = path.resolve(currentDirectory, filePath);
    }

    let stats = statOrNull(resolvedFilename);
    if (!stats) {
      return null;
    } else if (stats.isDirectory()) {
      resolvedFilename = path.resolve(resolvedFilename, './index.styl');
      if (!statOrNull(resolvedFilename)) {
        return null;
      }
    }
    return resolvedFilename;
  }

  const importer = {
    find(importPath, paths) {
      let filePath = parseImportPath(importPath, paths);
      if(!filePath) {
        return null;
      }

      return [filePath];
    },
    readFile(filePath) {
      return fs.readFileSync(filePath, 'utf8');
    }
  };

  function processSourcemap(sourcemap) {
    delete sourcemap.file;
    sourcemap.sourcesContent = sourcemap.sources.map(importer.readFile);
    sourcemap.sources = sourcemap.sources.map((filePath) => {
      return parseImportPath(filePath) || filePath;
    });

    return sourcemap;
  }

  let style = stylus(source)
    .use(nib())
    .set('filename', inputFile.getPathInPackage())
    .set('sourcemap', { inline: false, comment: false })
    .set('cache', true)
    .set('importer', importer);

  style.render((err, css) => {
    if (err) {
      cb(err, null);
    } else {
      const map = processSourcemap(style.sourcemap);
      cb(null, {
        css,
        map
      });
    }
  });

});
