import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import postcssModules from 'postcss-modules';
import SourceMapMerger from 'source-map-merger';

global._vue_js_cache = global._vue_js_cache || {};

// Tag handler
VueComponentTagHandler = class VueComponentTagHandler {
  constructor({ inputFile, parts, babelOptions, dependencyManager}) {
    this.inputFile = inputFile;
    this.parts = parts;
    this.babelOptions = babelOptions;
    this.dependencyManager = dependencyManager;

    this.component = {
      template: null,
      script: null,
      styles: []
    };
  }

  addTagToResults(tag) {
    this.tag = tag;

    if (this.tag.tagName === 'template') {
      if (this.component.template) {
        throwCompileError({
          inputFile: this.inputFile,
          message: 'Only one <template> allowed in component file',
          tag: 'template',
          charIndex: this.tag.tagStartIndex,
        })
      }

      this.component.template = this.tag;

    } else if (this.tag.tagName === 'script') {
      if (this.component.script) {
        throwCompileError({
          inputFile: this.inputFile,
          message: 'Only one <script> allowed in component file',
          tag: 'script',
          charIndex: this.tag.tagStartIndex,
        });
      }

      this.component.script = this.tag;

    } else if (this.tag.tagName === 'style') {

      this.component.styles.push(this.tag);

    } else {
      throwCompileError({
        inputFile: this.inputFile,
        message: 'Expected <template>, <script>, or <style> tag in template file',
      });
    }
  }

  getResults() {

    let map = '';
    let source = this.inputFile.getContentsAsString();
    let fileName = this.inputFile.getBasename();
    let packageName = this.inputFile.getPackageName();
    let inputFilePath = this.inputFile.getPathInPackage();
    let fullInputFilePath = packageName ? '/packages/' + packageName + '/' + inputFilePath : '/' + inputFilePath;
    let hash = 'data-v-' + Hash(fullInputFilePath);

    let js = '';
    let styles = [];

    // Script
    if (this.parts.script && this.component.script) {
      let tag = this.component.script;
      let script = tag.contents;
      let useBabel = true;
      jsHash = Hash(script);

      const maps = []

      maps.push(generateSourceMap(inputFilePath, source, script, getLineNumber(source, tag.tagStartIndex)))

      // Lang
      if (tag.attribs.lang !== undefined) {
        let lang = tag.attribs.lang;
        try {
          let compile = global.vue.lang[lang];
          if (!compile) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'script',
              charIndex: tag.tagStartIndex,
              action: 'compiling',
              lang,
              message: `Can't find handler for lang ${lang}, did you install it?`,
            });
          } else {
            //console.log(`Compiling <script> in lang ${lang}...`);
            let result = compile({
              source: script,
              inputFile: this.inputFile
            });
            script = result.script;
            if (result.map) {
              maps.push(result.map);
            }
            useBabel = result.useBabel;
          }
        } catch (e) {
          throwCompileError({
            inputFile: this.inputFile,
            tag: 'script',
            charIndex: tag.tagStartIndex,
            action: 'compiling',
            lang,
            error: e,
            showError: true
          });
        }
      }

      // Export
      script = script.replace(jsExportDefaultReg, 'return');

      // Babel
      if(useBabel) {
        // Babel options
        this.babelOptions.sourceMap = true;
        this.babelOptions.filename =
          this.babelOptions.sourceFileName = fullInputFilePath;
        this.babelOptions.sourceMapTarget = this.babelOptions.filename + '.map';

        // Babel compilation
        try {
          let output = Babel.compile(script, this.babelOptions);
          script = output.code;
          if (output.map) {
            maps.push(output.map);
          }
        } catch(e) {
          let errorOptions = {
            inputFile: this.inputFile,
            tag: 'script',
            charIndex: tag.tagStartIndex,
            action: 'compiling',
            message: (e.message?e.message:`An Babel error occured`),
            error: e,
          };

          if(e.loc) {
            errorOptions.line = e.loc.line;
            errorOptions.column = e.loc.column;
          } else {
            errorOptions.charIndex = tag.tagStartIndex;
            if(!e.message) {
              errorOptions.showError = true;
            } else {
              errorOptions.showStack = true;
            }
          }

          throwCompileError(errorOptions);
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
        console.error(`Error while mergin sourcemaps for ${inputFilePath}`, e.message)
        console.log(maps)
        map = maps[0]
      }

      if (typeof map === 'string') {
        map = JSON.parse(map)
      }
      map.sourcesContent = [ source ]
      map.names = lastMap.names
      map.file = this.inputFile.getPathInPackage()

      js += '__vue_script__ = (function(){' + script + '\n})();';
    }

    // Template
    let template;
    if (this.parts.template && this.component.template) {
      let templateTag = this.component.template;
      template = templateTag.contents;

      // Lang
      if (templateTag.attribs.lang !== undefined && templateTag.attribs.lang !== "html") {
        let lang = templateTag.attribs.lang;
        try {
          let compile = global.vue.lang[lang];
          if (!compile) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'template',
              charIndex: templateTag.tagStartIndex,
              action: 'compiling',
              lang,
              message: `Can't find handler for lang ${lang}, did you install it?`,
            });
          } else {
            //console.log(`Compiling <template> in lang ${lang}...`);
            let result = compile({
              source: template,
              inputFile: this.inputFile
            });
            template = result.template;
          }
        } catch (e) {
          throwCompileError({
            inputFile: this.inputFile,
            tag: 'template',
            charIndex: templateTag.tagStartIndex,
            action: 'compiling',
            lang,
            error: e,
            showError: true
          });
        }
      }

      // Tag hash (for scoping)
      if (vueVersion === 1) {
        template = template.replace(tagReg, (match, p1, p2, offset) => {
          let attributes = p2;
          if (!attributes) {
            return match.replace(p1, p1 + ` ${hash}`);
          } else {
            attributes += ` ${hash}`;
            return match.replace(p2, attributes);
          }
        });
      }
    }

    // Styles
    let cssModules;
    if(this.parts.style) {
      for (let styleTag of this.component.styles) {
        let css = styleTag.contents;
        let cssMap = null;

        // Lang
        if (styleTag.attribs.lang !== undefined && styleTag.attribs.lang !== 'css') {
          let lang = styleTag.attribs.lang;
          try {
            let compile = global.vue.lang[lang];
            if (!compile) {
              throwCompileError({
                inputFile: this.inputFile,
                tag: 'style',
                charIndex: styleTag.tagStartIndex,
                action: 'compiling',
                lang,
                message: `Can't find handler for lang ${lang}, did you install it?`,
              });
            } else {
              //console.log(`Compiling <style> in lang ${lang}...`);
              let result = compile({
                source: css,
                inputFile: this.inputFile,
                dependencyManager: this.dependencyManager
              });
              //console.log('Css result', result);
              css = result.css;
              cssMap = result.map;
            }
          } catch (e) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'style',
              charIndex: styleTag.tagStartIndex,
              action: 'compiling',
              lang,
              error: e,
              showError: true
            });
          }
        }

        // Postcss
        let plugins = [];
        let postcssOptions = {
          from: inputFilePath,
          to: inputFilePath,
          map: {
            inline: false,
            annotation: false,
            prev: cssMap
          }
        }

        // Scoped
        if (styleTag.attribs.scoped) {
          plugins.push(addHash({
            hash
          }));
        }

        // CSS Modules
        let isAsync = false;
        if (styleTag.attribs.module) {
          if (global.vue.cssModules) {
            try {
              let compile = global.vue.cssModules;
              //console.log(`Compiling <style> css modules ${lang}...`);
              let result = compile({
                source: css,
                map: cssMap,
                inputFile: this.inputFile,
                dependencyManager: this.dependencyManager,
                tag: styleTag,
              });
              // console.log('Css result', result);
              css = result.css;
              cssMap = result.map;
              if (result.cssModules) {
                cssModules = { ...(cssModules || {}), ...result.cssModules };
              }
              if (result.js) {
                js += result.js;
              }
            } catch (e) {
              throwCompileError({
                inputFile: this.inputFile,
                tag: 'style',
                charIndex: styleTag.tagStartIndex,
                action: 'compiling css modules',
                error: e,
                showError: true
              });
            }
          } else {
            const moduleName = typeof styleTag.attribs.module === 'string' ? styleTag.attribs.module : '';
            const scopedModuleName = moduleName ? `_${moduleName}` : '';
            plugins.push(postcssModules({
              getJSON(cssFilename, json) {
                cssModules = { ...(cssModules || {}), ...json };
              },
              generateScopedName(exportedName, filePath) {
                const path = require('path');
                let sanitisedPath = path.relative(process.cwd(), filePath).replace(/.*\{}[/\\]/, '').replace(/.*\{.*?}/, 'packages').replace(/\.[^\.\/\\]+$/, '').replace(/[\W_]+/g, '_');
                const filename = path.basename(filePath).replace(/\.[^\.\/\\]+$/, '').replace(/[\W_]+/g, '_');
                sanitisedPath = sanitisedPath.replace(new RegExp(`_(${filename})$`), '__$1');
                return `_${sanitisedPath}__${exportedName}`;
              },
            }));
            isAsync = true;
          }
        }

        // Autoprefixer
        if (styleTag.attribs.autoprefix !== 'off') {
          plugins.push(autoprefixer());
        }

        // Postcss result
        let result;
        if (isAsync) {
          result = Promise.await(postcss(plugins).process(css, postcssOptions));
        } else {
          result = postcss(plugins).process(css, postcssOptions);
        }

        css = result.css;
        cssMap = result.map;

        styles.push({
          css,
          map: cssMap
        })
      }
    }

    let compileResult = {
      code: js,
      map,
      styles,
      template,
      cssModules,
      hash,
    };

    //console.log('Result', compileResult);

    return compileResult;
  }
}
