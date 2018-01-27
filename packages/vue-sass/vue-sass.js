import path from 'path'
import fs from 'fs'
import sass from 'node-sass'
import { Meteor } from 'meteor/meteor'

global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

function resolveImport (dependencyManager) {
  return function (url, prev, done) {
    let resolvedFilename
    url = url.replace(/^["']?(.*?)["']?$/, '$1')
    if (url.indexOf('~') === 0 || url.indexOf('/') === 0) {
      resolvedFilename = url.substr(1)
    /* } else if (url.indexOf('{') === 0) {
      resolvedFilename = decodeFilePath(url) */
    } else {
      let currentDirectory = path.dirname(this.options.outFile)
      resolvedFilename = path.resolve(currentDirectory, url)
    }

    resolvedFilename = discoverImportPath(resolvedFilename)
    if (resolvedFilename === null) {
      done(new Error('Unknown import (file not found): ' + url))
    } else {
      dependencyManager.addDependency(resolvedFilename)

      done({
        file: resolvedFilename,
      })
    }
  }
}

function discoverImportPath (importPath) {
  const potentialPaths = [importPath]
  const potentialFileExtensions = ['scss', 'sass']

  if (!path.extname(importPath)) {
    potentialFileExtensions.forEach(extension => potentialPaths.push(`${importPath}.${extension}`))
  }
  if (path.basename(importPath)[0] !== '_') {
    [].concat(potentialPaths).forEach(potentialPath => potentialPaths.push(`${path.dirname(potentialPath)}/_${path.basename(potentialPath)}`))
  }

  for (let i = 0, potentialPath = potentialPaths[i]; i < potentialPaths.length; i++, potentialPath = potentialPaths[i]) {
    if (fs.existsSync(potentialPaths[i]) && fs.lstatSync(potentialPaths[i]).isFile()) {
      return potentialPath
    }
  }

  return null
}

// function decodeFilePath (filePath) {
//   const match = filePath.match(/^{(.*)}\/(.*)$/)
//   if (!match)
//     {throw new Error('Failed to decode Sass path: ' + filePath)}

//   if (match[1] === '') {
//     // app
//     return match[2]
//   }

//   return 'packages/' + match[1] + '/' + match[2]
// }

global.vue.lang.scss = Meteor.wrapAsync(function ({
  source,
  basePath,
  inputFile,
  dependencyManager,
}, cb) {
  if (!source.trim()) {
    cb(null, { css: '' })
    return
  }
  sass.render({
    data: source,
    importer: resolveImport(dependencyManager),
    outFile: inputFile.getPathInPackage() + '.css',
    sourceMap: true,
    sourceMapContents: true,
  }, function (error, result) {
    if (error) {
      cb(error, null)
    } else {
      cb(null, {
        css: result.css.toString(),
        map: result.map.toString(),
      })
    }
  })
})

global.vue.lang.sass = Meteor.wrapAsync(function ({
  source,
  basePath,
  inputFile,
  dependencyManager,
}, cb) {
  if (!source.trim()) {
    cb(null, { css: '' })
    return
  }
  sass.render({
    data: source,
    importer: resolveImport(dependencyManager),
    outFile: basePath + '.css',
    sourceMap: true,
    sourceMapContents: true,
    indentedSyntax: true,
  }, function (error, result) {
    if (error) {
      cb(error, null)
    } else {
      cb(null, {
        css: result.css.toString(),
        map: result.map.toString(),
      })
    }
  })
})
