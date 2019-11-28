import path from 'path'
import fs from 'fs'
import stylus from 'stylus'
import nib from 'nib'
import { Meteor } from 'meteor/meteor'

global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

function statOrNull (path) {
  try {
    return fs.statSync(path)
  } catch (e) {
    return null
  }
}

global.vue.lang.stylus = Meteor.wrapAsync(function ({
  source,
  basePath,
  inputFile,
  dependencyManager,
}, cb) {
  function parseImportPath (filePath, importerDir) {
    let resolvedFilename
    if (filePath.indexOf('~') === 0) {
      resolvedFilename = filePath.substr(1)
      /* } else if (filename.indexOf('{') === 0) {
        resolvedFilename = decodeFilePath(filename) */
    } else {
      let currentDirectory = path.dirname(basePath)
      resolvedFilename = path.resolve(currentDirectory, filePath)
    }

    let stats = statOrNull(resolvedFilename)
    if (!stats) {
      return null
    } else if (stats.isDirectory()) {
      resolvedFilename = path.resolve(resolvedFilename, './index.styl')
      if (!statOrNull(resolvedFilename)) {
        return null
      }
    }
    return resolvedFilename
  }

  const importer = {
    find (importPath, paths) {
      let filePath = parseImportPath(importPath, paths)
      if (!filePath) {
        return null
      }
      dependencyManager.addDependency(filePath)
      return [filePath]
    },
    readFile (filePath) {
      return fs.readFileSync(filePath, 'utf8')
    },
  }

  function processSourcemap (sourcemap) {
    delete sourcemap.file
    sourcemap.sourcesContent = sourcemap.sources.map(importer.readFile)
    sourcemap.sources = sourcemap.sources.map((filePath) => {
      return parseImportPath(filePath) || filePath
    })

    return sourcemap
  }

  let renderer = stylus(source)
    .use(nib())
    .set('filename', basePath)
    .set('sourcemap', { inline: false, comment: false })
    .set('cache', true)
    .set('importer', importer)

  renderer.render((err, css) => {
    if (err) {
      cb(err, null)
    } else {
      renderer.deps(basePath).forEach(file => dependencyManager.addDependency(file))
      const map = processSourcemap(renderer.sourcemap)
      cb(null, {
        css,
        map,
      })
    }
  })
})
