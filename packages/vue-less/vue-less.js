import path from 'path'
import fs from 'fs'
import less from 'less'
import {Meteor} from 'meteor/meteor'

global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

class MeteorImportLessPlugin {
  constructor (dependencyManager) {
    this.minVersion = [2, 5, 0]
    // Fix cloning error in less
    Object.defineProperty(this, 'dependencyManager', {
      value: dependencyManager,
      enumerable: false,
    })
  }

  install (less, pluginManager) {
    pluginManager.addFileManager(new MeteorImportLessFileManager(this.dependencyManager))
  }
}

class MeteorImportLessFileManager extends less.AbstractFileManager {
  constructor (dependencyManager) {
    super()
    // Fix cloning error in less
    Object.defineProperty(this, 'dependencyManager', {
      value: dependencyManager,
      enumerable: false,
    })
  }

  // We want to be the only active FileManager, so claim to support everything.
  supports (filename) {
    // We shouldn't process files that start with `//` or a protocol because
    // those are not relative to the app at all they are probably native
    // CSS imports
    if (!filename.match(/^(https?:)?\/\//)) {
      return true
    }

    return false
  }

  loadFile (filename, currentDirectory, options, environment, cb) {
    // console.log(filename, currentDirectory)
    // console.log("### options", options, "### env", environment, "###")

    let resolvedFilename
    if (filename.indexOf('~') === 0) {
      resolvedFilename = filename.substr(1)
    /* } else if (filename.indexOf('{') === 0) {
      resolvedFilename = decodeFilePath(filename) */
    } else {
      resolvedFilename = path.resolve(currentDirectory, filename)
    }

    if (!/\.less$/i.test(resolvedFilename)) {
      resolvedFilename += '.less'
    }

    if (!fs.existsSync(resolvedFilename)) {
      cb({
        type: 'File',
        message: 'Unknown import (file not found): ' + filename,
      })
    } else {
      let contents = fs.readFileSync(resolvedFilename, {
        encoding: 'utf8',
      })

      cb(null, {
        contents,
        filename: resolvedFilename,
      })

      if (this.dependencyManager) {
        this.dependencyManager.addDependency(resolvedFilename)
      } else {
        console.error('this.dependencyManager undefined')
      }
    }
  }
}

// function decodeFilePath (filePath) {
//   const match = filePath.match(/^{(.*)}\/(.*)$/)
//   if (!match) { throw new Error('Failed to decode Less path: ' + filePath) }

//   if (match[1] === '') {
//     // app
//     return match[2]
//   }

//   return 'packages/' + match[1] + '/' + match[2]
// }

const importPlugins = {}

function getKey (inputFile) {
  return `${inputFile.getPackageName()}:${inputFile.getPathInPackage()}`
}

function getImportPlugin (inputFile, dependencyManager) {
  const key = getKey(inputFile)
  let result = importPlugins[key]
  if (!result) {
    result = importPlugins[key] = new MeteorImportLessPlugin(dependencyManager)
  }
  return result
}

global.vue.lang.less = Meteor.wrapAsync(function ({
  source,
  inputFile,
  basePath,
  dependencyManager,
}, cb) {
  less.render(source, {
    filename: basePath,
    plugins: [getImportPlugin(inputFile, dependencyManager)],
    sourceMap: {
      outputSourceFiles: true,
    },
  }).then(function (output) {
    cb(null, {
      css: output.css,
      map: output.map,
    })
  }, function (error) {
    console.error(error)
    cb(error, null)
  })
})
