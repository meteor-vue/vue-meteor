import { Meteor } from 'meteor/meteor'
import { CoffeeScriptCompiler } from 'meteor/coffeescript-compiler'

const coffeeScriptCompiler = new CoffeeScriptCompiler()

global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}

global.vue.lang.coffee = Meteor.wrapAsync(function ({ source, inputFile }, callback) {
  // Override this method so that it returns only the source within the <script> tags.
  inputFile.getContentsAsString = function () {
    return source
  }
  // Make sure CoffeeScriptCompiler doesn’t think that this is Literate CoffeeScript.
  inputFile.getExtension = function () {
    return 'coffee'
  }

  const sourceWithMap = coffeeScriptCompiler.compileOneFile(inputFile)

  callback(null, {
    script: sourceWithMap.source,
    map: sourceWithMap.sourceMap,
    useBabel: false,
  })
})
