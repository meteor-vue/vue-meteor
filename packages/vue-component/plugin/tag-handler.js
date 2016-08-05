import postcss from 'postcss';
//import autoprefixer from 'autoprefixer';

global._vue_js_cache = global._vue_js_cache || {};

// Tag handler
VueComponentTagHandler = class VueComponentTagHandler {
  constructor({ inputFile, babelOptions, dependencyManager }) {
    this.inputFile = inputFile;
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
    let packageName = this.inputFile.getPackageName();
    let inputFilePath = this.inputFile.getPathInPackage();
    let hash = '__v' + FileHash(this.inputFile);

    let js = '';
    let styles = [];

    // Script
    if (this.component.script) {
      let tag = this.component.script;
      let script = tag.contents;
      let useBabel = true;
      jsHash = Hash(script);

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
            map = result.map;
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
          this.babelOptions.sourceFileName = packageName ? '/packages/' + packageName + '/' + inputFilePath : '/' + inputFilePath;
        this.babelOptions.sourceMapTarget = this.babelOptions.filename + '.map';

        // Babel compilation
        try {
          let output = Babel.compile(script, this.babelOptions);
          script = output.code;
          map = output.map;
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

      js += '__vue_script__ = (function(){' + script + '\n})();';
    }

    // Template
    let template;
    if (this.component.template) {
      let templateTag = this.component.template;
      template = templateTag.contents;

      // Lang
      if (templateTag.attribs.lang !== undefined) {
        let lang = templateTag.attribs.lang;
        try {
          let compile = global.vue.lang[lang];
          if (!compile) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'template',
              charIndex: tag.tagStartIndex,
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
            charIndex: tag.tagStartIndex,
            action: 'compiling',
            lang,
            error: e,
            showError: true
          });
        }
      }

      // Tag hash (for scoping)
      let result;
      template = template.replace(tagReg, (match, p1, p2, offset) => {
        let attributes = p2;
        if (!attributes) {
          return match.replace(p1, p1 + ` ${hash}`);
        } else {
          attributes += ` ${hash}`;
          return match.replace(p2, attributes);
        }
      });

      template = template.replace(quoteReg, '&#39;').replace(lineReg, '');
    }

    // Styles
    for (let styleTag of this.component.styles) {
      let css = styleTag.contents;
      let cssMap = null;

      // Lang
      if (styleTag.attribs.lang !== undefined) {
        let lang = styleTag.attribs.lang;
        try {
          let compile = global.vue.lang[lang];
          if (!compile) {
            throwCompileError({
              inputFile: this.inputFile,
              tag: 'style',
              charIndex: tag.tagStartIndex,
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
        form: inputFilePath,
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

      // Autoprefixer
      if (styleTag.attribs.autoprefix !== 'off') {
        // Removed - Performance issue while loading the plugin
        //plugins.push(autoprefixer());
      }

      // Postcss result
      let result = postcss(plugins).process(css, postcssOptions);
      css = result.css;
      cssMap = result.map;

      styles.push({
        css,
        map: cssMap
      })
    }

    let compileResult = {
      code: js,
      map,
      styles,
      template
    };

    //console.log('Result', compileResult);

    return compileResult;
  }
}
