import fs from 'fs'
import path from 'path'
import { Meteor } from 'meteor/meteor'
import hash from 'hash-sum'
import sourceMap from 'source-map'

Config = {}

FileHash = function (inputFile) {
  let filePath = inputFile.getPackageName() + ':' + inputFile.getPathInPackage()
  return Hash(filePath)
}

Hash = function (text) {
  return hash(text)
}

IGNORE_FILE = '.vueignore'
CWD = path.resolve('./')

function getVueVersion () {
  const packageFile = path.join(CWD, 'package.json')

  if (fs.existsSync(packageFile)) {
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'))

    // Override
    if (pkg.meteor && typeof pkg.meteor.vueVersion !== 'undefined') {
      return parseInt(pkg.meteor.vueVersion)
    }

    const vue = (pkg.dependencies && pkg.dependencies.vue) ||
    (pkg.devDependencies && pkg.devDependencies.vue) ||
    (pkg.peerDependencies && pkg.peerDependencies.vue)

    if (vue) {
      const reg = /\D*(\d).*/gi
      const result = reg.exec(vue)
      if (result && result.length >= 2) {
        return parseInt(result[1])
      }
    }
  }

  return 1
}

vueVersion = getVueVersion()

normalizeCarriageReturns = function (contents, str = '\n') {
  return contents.replace(rnReg, str).replace(rReg, str)
}

getFullDirname = function (inputFile) {
  const packageName = inputFile.getPackageName()
  return (packageName ? packageName + '/' : '') + inputFile.getDirname()
}

getFullPathInApp = function (inputFile) {
  const packageName = inputFile.getPackageName()
  return (packageName ? packageName + '/' : '') + inputFile.getPathInPackage()
}

getFilePath = function (inputFile) {
  const sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot)
  return path.resolve(sourceRoot, inputFile.getPathInPackage())
}

isDevelopment = function () {
  return Meteor.isDevelopment
}

getLineNumber = function (contents, charIndex) {
  const text = normalizeCarriageReturns(contents.substring(0, charIndex))
  return text.split('\n').length
}

getLineInInputFile = function (inputFile, charIndex) {
  return getLineNumber(inputFile.getContentsAsString(), charIndex)
}

generateSourceMap = function (filename, source, generated, offset) {
  var map = new sourceMap.SourceMapGenerator()
  map.setSourceContent(filename, source)
  generated.split(splitRE).forEach((line, index) => {
    if (!emptyRE.test(line)) {
      map.addMapping({
        source: filename,
        original: {
          line: index + offset,
          column: 0,
        },
        generated: {
          line: index + 1,
          column: 0,
        },
      })
    }
  })
  return map.toJSON()
}

printSourceMap = function (map) {
  const consumer = new sourceMap.SourceMapConsumer(map)
  consumer.eachMapping(m => {
    console.log(m)
  })
  console.log(map)
}

throwCompileError = function throwCompileError (options) {
  options = Object.assign({}, {
    showError: false,
    showStack: false,
  }, options)

  const {
    inputFile,
    path,
    action,
    message,
    line,
    column,
    tag,
    lang,
    charIndex,
    error,
    showError,
    showStack,
  } = options

  let output = '[vue-component] Error'

  // Action
  if (action) {
    output += ' while ' + action
  }

  // Tag
  if (tag) {
    output += ' in tag <' + tag + '>'
  }

  if (column) {
    output += ' col:' + column
  }

  // Lang
  if (lang) {
    output += ' using lang ' + lang
  }

  // Message
  if (message) {
    output += ': ' + message
  }

  // Error location
  let file
  if (path) {
    file = path
  } else if (inputFile) {
    file = getFullPathInApp(inputFile)
  } else {
    file = '(unknown source file)'
  }

  let lineNumber = line
  if (charIndex && inputFile) {
    const lineResult = getLineInInputFile(inputFile, charIndex) - 1
    if (lineNumber) {
      lineNumber += lineResult
    } else {
      lineNumber = lineResult
    }
  }
  if (!lineNumber) {
    lineNumber = 1
  }

  // Native error
  if (showError) {
    output += ` ${error.message}`
  }

  // Stack
  if (showStack && error && error.stack) {
    ouput += '\n' + error.stack
  }

  if (isDevelopment()) {
    global._dev_server.emit('message', {
      type: 'error',
      message: `${file}:${lineNumber}  ${output}`,
    })
  }

  const err = new TemplatingTools.CompileError()
  err.message = output
  err.file = file
  err.line = lineNumber
  throw err
}

getFileContents = (path) => {
  if (!fs.existsSync(path)) {
    throw new Error('file-not-found')
  } else {
    return fs.readFileSync(path, {
      encoding: 'utf8',
    })
  }
}
