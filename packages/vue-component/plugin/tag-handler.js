import postcss from 'postcss';
//import autoprefixer from 'autoprefixer';

global._vue_js_cache = global._vue_js_cache || {};

// Tag handler
VueComponentTagHandler = class VueComponentTagHandler {
  constructor({ inputFile, allFiles, babelOptions }) {
    this.inputFile = inputFile;
    this.allFiles = allFiles;
    this.babelOptions = babelOptions;

    this.component = {
      template: null,
      script: null,
      styles: []
    };
  }

  addTagToResults(tag) {
    this.tag = tag;

    try {
      if (this.tag.tagName === "template") {
        if (this.component.template) {
          this.throwCompileError("Only one <template> allowed in component file", this.tag.tagStartIndex)
        }

        this.component.template = this.tag;

      } else if (this.tag.tagName === "script") {
        if (this.component.script) {
          this.throwCompileError("Only one <script> allowed in component file", this.tag.tagStartIndex)
        }

        this.component.script = this.tag;

      } else if (this.tag.tagName === "style") {

        this.component.styles.push(this.tag);

      } else {
        this.throwCompileError("Expected <template>, <script>, or <style> tag in template file", this.tag.tagStartIndex);
      }
    } catch (e) {
      if (e.scanner) {
        // The error came from Spacebars
        this.throwCompileError(e.message, this.tag.contentsStartIndex + e.offset);
      } else {
        throw e;
      }
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
            this.throwCompileError(`Can't find handler for lang ${lang} in vue component ${inputFilePath} in <script>. Did you install it?`);
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
          console.error(`Error while compiling script with lang ${lang} in file ${inputFilePath} in <script>`, e);
        }
      }

      // Export
      script = script.replace(jsExportDefaultReg, 'return');

      // Babel
      if(useBabel) {
        // Babel options
        this.babelOptions.sourceMap = true;
        this.babelOptions.filename =
          this.babelOptions.sourceFileName = packageName ? "/packages/" + packageName + "/" + inputFilePath : "/" + inputFilePath;
        this.babelOptions.sourceMapTarget = this.babelOptions.filename + ".map";

        // Babel compilation
        let output = Babel.compile(script, this.babelOptions);
        script = output.code;
        map = output.map;
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
            this.throwCompileError(`Can't find handler for lang ${lang} in vue component ${inputFilePath} in <template>. Did you install it?`);
          } else {
            //console.log(`Compiling <template> in lang ${lang}...`);
            let result = compile({
              source: template,
              inputFile: this.inputFile
            });
            template = result.template;
          }
        } catch (e) {
          console.error(`Error while compiling style with lang ${lang} in file ${inputFilePath} in <template>`, e);
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

      template = template.replace(quoteReg, "&#39;").replace(lineReg, '');
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
            this.throwCompileError(`Can't find handler for lang ${lang} in vue component ${inputFilePath} in <style>. Did you install it?`);
          } else {
            //console.log(`Compiling <style> in lang ${lang}...`);
            let result = compile({
              source: css,
              inputFile: this.inputFile
            });
            //console.log("Css result", result);
            css = result.css;
            cssMap = result.map;
          }
        } catch (e) {
          console.error(`Error while compiling style with lang ${lang} in file ${inputFilePath} in <style>`, e);
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

    //console.log("Result", compileResult);

    return compileResult;
  }

  throwCompileError(message, overrideIndex) {
    throwCompileError(this.tag, message, overrideIndex);
  }
}


const jsImportsReg = /import\s+.+\s+from\s+.+;?\s*/g;
const jsExportDefaultReg = /export\s+default/g;
const quoteReg = /'/g;
const lineReg = /\r?\n|\r/g;
const tagReg = /<([\w\d-]+)(\s+.*?)?\/?>/ig;
const classAttrReg = /\s+class=(['"])(.*?)\1/gi;
