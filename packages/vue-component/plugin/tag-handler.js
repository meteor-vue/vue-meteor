import path from 'path'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import postcssModules from 'postcss-modules'
import SourceMapMerger from 'source-map-merger'

global._vue_js_cache = global._vue_js_cache || {}

// Tag handler
VueComponentTagHandler = class VueComponentTagHandler {
  constructor ({ inputFile, parts, babelOptions, dependencyManager, sfcDescriptor }) {
    this.inputFile = inputFile
    this.parts = parts
    this.babelOptions = babelOptions
    this.dependencyManager = dependencyManager
    this.sfcDescriptor = sfcDescriptor

    // Load 'src'
    this.sfcDescriptor.template && this.processBlockSrc(this.sfcDescriptor.template)
    this.sfcDescriptor.script && this.processBlockSrc(this.sfcDescriptor.script)
    this.sfcDescriptor.styles && this.sfcDescriptor.styles.forEach(
      block => this.processBlockSrc(block)
    )
  }

  processBlockSrc (sfcBlock) {
    if (sfcBlock.src) {
      const filePath = path.resolve(path.dirname(getFilePath(this.inputFile)), sfcBlock.src)
      try {
        sfcBlock.origin = Object.assign({}, sfcBlock)
        sfcBlock.module = filePath
        sfcBlock.content = getFileContents(filePath)
        sfcBlock.start = 0
        sfcBlock.end = sfcBlock.content.length
        this.dependencyManager.addDependency(filePath)
      } catch (e) {
        if (e.message === 'file-not-found') {
          throwCompileError({
            inputFile: this.inputFile,
            message: `File ${filePath} not found.`,
            tag: sfcBlock.module,
            charIndex: sfcBlock.start,
          })
        } else {
          throw e
        }
      }
    } else {
      sfcBlock.module = path.resolve(getFilePath(this.inputFile))
    }
  }

  getResults () {
    let map = ''
    let source = this.inputFile.getContentsAsString()
    let packageName = this.inputFile.getPackageName()
    let inputFilePath = this.inputFile.getPathInPackage()
    let fullInputFilePath = packageName ? '/packages/' + packageName + '/' + inputFilePath : '/' + inputFilePath
    let hash = 'data-v-' + Hash(fullInputFilePath)
    
    let js = ''
    let styles = []

    // Script
    if (this.parts.script && this.sfcDescriptor.script) {
      let sfcBlock = this.sfcDescriptor.script
      let script = sfcBlock.content
      let useBabel = true
      jsHash = Hash(script)

      const maps = []

      maps.push(generateSourceMap(inputFilePath, source, script, getLineNumber(source, sfcBlock.start)))

      // Lang or compiler

      // cpl is a custom compiler defined by another package
      // Specially useful when using vscode+vetur, as the dev experience
      // with vetur is affected is not optimal when using lang attr
      // in script tag
      const cpl = sfcBlock.attrs?.cpl
      let lang = sfcBlock.lang || cpl

      if (lang !== undefined) {
        try {
          let compile = global.vue.lang[lang]
          if (!compile) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'script',
              charIndex: sfcBlock.start,
              action: 'compiling',
              lang,
              message: `Can't find handler for lang '${lang}', did you install it?`.yellow,
            })
          } else {
            // console.log(`Compiling <script> in lang ${lang}...`)
            let result = compile({
              source: script,
              inputFile: this.inputFile,
              basePath: sfcBlock.module,
              dependencyManager: this.dependencyManager,
            })
            script = result.script
            if (result.map) {
              maps.push(result.map)
            }
            useBabel = result.useBabel
          }
        } catch (e) {
          throwCompileError({
            inputFile: this.inputFile,
            tag: 'script',
            charIndex: sfcBlock.start,
            action: 'compiling',
            lang,
            error: e,
            showError: true,
            showStack: true,
          })
        }
      }

      // Export

      // Babel
      if (useBabel) {
        // Babel options
        this.babelOptions.babelrc = true
        this.babelOptions.sourceMaps = true
        this.babelOptions.filename =
          this.babelOptions.sourceFileName = sfcBlock.module

        // Babel compilation
        try {
          let output = Babel.compile(script, this.babelOptions)
          script = output.code
          if (output.map) {
            maps.push(output.map)
          }
        } catch (e) {
          let errorOptions = {
            inputFile: this.inputFile,
            tag: 'script',
            charIndex: sfcBlock.start,
            action: 'compiling',
            message: (e.message ? e.message : `An Babel error occured`),
            error: e,
          }

          if (e.loc) {
            errorOptions.line = e.loc.line
            errorOptions.column = e.loc.column
          } else {
            errorOptions.charIndex = sfcBlock.start
            if (!e.message) {
              errorOptions.showError = true
            } else {
              errorOptions.showStack = true
            }
          }

          throwCompileError(errorOptions)
        }
      }

      const lastMap = maps[maps.length - 1]

      // Merge source maps
      try {
        if (maps.length > 1) {
          map = SourceMapMerger.createMergedSourceMap(maps, true)
        } else {
          map = maps[0]
        }
      } catch (e) {
        console.error(`Error while mergin sourcemaps for ${inputFilePath}`.red, e.message)
        console.log(maps)
        map = maps[0]
      }

      if (typeof map === 'string') {
        map = JSON.parse(map)
      }
      map.sourcesContent = [ source ]
      map.names = lastMap.names
      map.file = this.inputFile.getPathInPackage()

      js += 'module.exportDefault = function(value) { __vue_script__ = value; }; (function(){' + script + '\n})();'
    }

    // Template
    let template
    if (this.parts.template && this.sfcDescriptor.template) {
      let sfcBlock = this.sfcDescriptor.template
      template = sfcBlock.content

      // Lang
      if (sfcBlock.lang !== undefined && sfcBlock.lang !== 'html') {
        let lang = sfcBlock.lang
        try {
          let compile = global.vue.lang[lang]
          if (!compile) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'template',
              charIndex: sfcBlock.start,
              action: 'compiling',
              lang,
              message: `Can't find handler for lang '${lang}', did you install it?`.yellow,
            })
          } else {
            // console.log(`Compiling <template> in lang ${lang}...`)
            let result = compile({
              source: template,
              inputFile: this.inputFile,
              basePath: sfcBlock.module,
              dependencyManager: this.dependencyManager,
            })
            template = result.template
          }
        } catch (e) {
          throwCompileError({
            inputFile: this.inputFile,
            tag: 'template',
            charIndex: sfcBlock.start,
            action: 'compiling',
            lang,
            error: e,
            showError: true,
            showStack: true,
          })
        }
      }

      // Tag hash (for scoping)
      if (vueVersion === 1) {
        template = template.replace(tagReg, (match, p1, p2, offset) => {
          let attributes = p2
          if (!attributes) {
            return match.replace(p1, p1 + ` ${hash}`)
          } else {
            attributes += ` ${hash}`
            return match.replace(p2, attributes)
          }
        })
      }
    }

    // Styles
    let cssModules
    if (this.parts.style) {
      for (let sfcBlock of this.sfcDescriptor.styles) {
        let css = sfcBlock.content
        let cssMap = null

        // Lang
        if (sfcBlock.lang !== undefined && sfcBlock.lang !== 'css') {
          let lang = sfcBlock.lang
          try {
            let compile = global.vue.lang[lang]
            if (!compile) {
              throwCompileError({
                inputFile: this.inputFile,
                tag: 'style',
                charIndex: sfcBlock.start,
                action: 'compiling',
                lang,
                message: `Can't find handler for lang '${lang}', did you install it?`.yellow,
              })
            } else {
              // console.log(`Compiling <style> in lang ${lang}...`)
              let result = compile({
                source: css,
                inputFile: this.inputFile,
                basePath: sfcBlock.module,
                dependencyManager: this.dependencyManager,
              })
              // console.log('Css result', result)
              css = result.css
              cssMap = result.map
            }
          } catch (e) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'style',
              charIndex: sfcBlock.start,
              action: 'compiling',
              lang,
              error: e,
              showError: true,
              showStack: true,
            })
          }
        }

        // Postcss
        let plugins = []
        let customPostcssOptions = {}
        try {
          customPostcssOptions = loadPostcssConfig()
        } catch (e) {
          throwCompileError({
            inputFile: this.inputFile,
            tag: 'style',
            charIndex: sfcBlock.start,
            action: 'configuring PostCSS (custom configuration)',
            error: e,
            showError: true,
            showStack: true,
          })
        }
        let postcssOptions = Object.assign({
          from: inputFilePath,
          to: inputFilePath,
          map: {
            inline: false,
            annotation: false,
            prev: cssMap,
          },
        }, customPostcssOptions)

        plugins.push(trimCSS)

        // Scoped
        if (sfcBlock.scoped) {
          plugins.push(scopeId({
            id: hash,
          }))
        }

        // CSS Modules
        let isAsync = false
        let defaultModuleName = '$style'
        if (sfcBlock.attrs.module) {
          if (global.vue.cssModules) {
            try {
              let compile = global.vue.cssModules
              // console.log(`Compiling <style> css modules ${lang}...`)
              let result = compile({
                source: css,
                map: cssMap,
                inputFile: this.inputFile,
                dependencyManager: this.dependencyManager,
                tag: sfcBlock,
                cssModules,
              })
              // console.log('Css result', result)
              css = result.css
              cssMap = result.map
              cssModules = result.cssModules
              if (result.js) {
                js += result.js
              }
            } catch (e) {
              throwCompileError({
                inputFile: this.inputFile,
                tag: 'style',
                charIndex: sfcBlock.start,
                action: 'compiling css modules',
                error: e,
                showError: true,
                showStack: true,
              })
            }
          } else {
            const moduleName = typeof sfcBlock.attrs.module === 'string' ? sfcBlock.attrs.module : defaultModuleName
            plugins.push(postcssModules({
              getJSON (cssFilename, json) {
                if (cssModules === undefined) { cssModules = {} }
                cssModules[moduleName] = { ...(cssModules[moduleName] || {}), ...json }
              },

              // Generate a class name in the form of .<vue_component_name>_<local_class_name>__<hash>
              // Ref.: https://github.com/css-modules/postcss-modules#generating-scoped-names
              generateScopedName: '[name]_[local]__[hash:base64:5]'
            }))
            isAsync = true
          }
        }

        // Autoprefixer
        if (sfcBlock.attrs.autoprefix !== 'off') {
          plugins.push(autoprefixer())
        }

        // Postcss result
        let result
        if (isAsync) {
          result = Promise.await(postcss(plugins).process(css, postcssOptions))
        } else {
          result = postcss(plugins).process(css, postcssOptions)
        }

        css = result.css
        cssMap = result.map

        styles.push({
          css,
          map: cssMap,
        })
      }
    }

    if (cssModules && !global.vue.cssModules) {
      cssModules = Object.keys(cssModules).reduce((result, key) => {
        result[key] = JSON.stringify(cssModules[key])
        return result
      }, {})
    }

    let compileResult = {
      code: js,
      map,
      styles,
      template,
      cssModules,
      hash,
    }

    // console.log('Result', compileResult)

    return compileResult
  }
}
