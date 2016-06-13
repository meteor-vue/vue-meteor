global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

import path from 'path';
import fs from 'fs';
import sass from 'node-sass';
import {Meteor} from 'meteor/meteor';

function resolveImport(url, prev, done) {
  let resolvedFilename;
  if (url.indexOf('~') === 0) {
    resolvedFilename = url.substr(1);
  /*} else if (url.indexOf('{') === 0) {
    resolvedFilename = decodeFilePath(url);*/
  } else {
    let currentDirectory = path.dirname(this.options.outFile);
    resolvedFilename = path.resolve(currentDirectory, url);
  }

  if (!fs.existsSync(resolvedFilename)) {
    done(new Error('Unknown import (file not found): ' + url));
  } else {
    done({
      file: resolvedFilename
    });
  }
}

function decodeFilePath(filePath) {
  const match = filePath.match(/^{(.*)}\/(.*)$/);
  if (!match)
    throw new Error('Failed to decode Sass path: ' + filePath);

  if (match[1] === '') {
    // app
    return match[2];
  }

  return 'packages/' + match[1] + '/' + match[2];
}

global.vue.lang.scss = Meteor.wrapAsync(function({
  source,
  inputFile
}, cb) {
  sass.render({
    data: source,
    importer: resolveImport,
    outFile: inputFile.getPathInPackage() + '.css',
    sourceMap: true,
    sourceMapContents: true
  }, function(error, result) {
    if (error) {
      cb(error, null);
    } else {
      cb(null, {
        css: result.css.toString(),
        map: result.map.toString()
      })
    }
  })
});

global.vue.lang.sass = Meteor.wrapAsync(function({
  source,
  inputFile
}, cb) {
  sass.render({
    data: source,
    importer: resolveImport,
    outFile: inputFile.getPathInPackage() + '.css',
    sourceMap: true,
    sourceMapContents: true,
    indentedSyntax: true
  }, function(error, result) {
    if (error) {
      cb(error, null);
    } else {
      cb(null, {
        css: result.css.toString(),
        map: result.map.toString()
      })
    }
  })
});
