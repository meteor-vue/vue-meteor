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
      let currentDirectory = path.dirname(prev === 'stdin' ? this.options.outFile : prev)
      resolvedFilename = path.resolve(currentDirectory, url)
    }
    const importPaths = [resolvedFilename]
    const pkg = require('package.json') // can not be moved outside. Reqired here to get the package.json of the project that is being run

    try {
      // get the package.json config option and create paths for the requested file.
      pkg.vue.css.sass.includePaths.forEach((str) => {
        importPaths.push(path.resolve(str, url))
      })
    } catch (e) {
      // Ignore error. package.json option is not set.
    }

    const resolvedNames = importPaths.map(discoverImportPath).filter(
      fileName => fileName !== null && typeof fileName !== 'undefined'
    )

    if (resolvedNames.length < 1) {
      done(new Error('Unknown import (file not found): ' + url))
    } else {
      dependencyManager.addDependency(resolvedNames[0])

      done({
        file: resolvedNames[0],
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

  potentialPaths.forEach((path) => {
    if(fs.existsSync(path)) {
      const stat = fs.lstatSync(path);

      // if path is an symlink, check if the symlink points to a file
      if(stat.isSymbolicLink()) {
        try {
          const realPath = fs.realpathSync(path);
          if(fs.lstatSync(realPath).isFile()) {
            return path;
          }
        } catch (e) {
          // ignore errors
        }
      } else if(stat.isFile()) {
        return path;
      }
    }
  });

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
