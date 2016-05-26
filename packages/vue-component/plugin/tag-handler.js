import sourcemap from "source-map";
import mss from "multi-stage-sourcemap";

const jsImportsReg = /import\s+.+\s+from\s+.+;?\s*/g;
const jsExportDefaultReg = /export\s+default/g;

VueComponentTagHandler = class VueComponentTagHandler {
  constructor(inputFile, babelOptions) {
    this.inputFile = inputFile;
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

    let source = this.inputFile.getContentsAsString();
    let packageName = this.inputFile.getPackageName();
    let inputFilePath = this.inputFile.getPathInPackage();

    let mapGenerator = new sourcemap.SourceMapGenerator({
      file: inputFilePath + '.js'
    });

    let js = 'var __vue_script__, __vue_template__;\n';

    // Script

    if (this.component.script) {
      let tag = this.component.script;
      let script = tag.contents;
      let startLine = source.substr(0, tag.contentsStartIndex).split('\n').length;

      // Imports
      let imports = '';
      script = script.replace(jsImportsReg, (match) => {
        imports += match + '\n';
        return '//' + match;
      });

      // Export
      script = script.replace(jsExportDefaultReg, 'return');

      // Sourcemap
      let lines = script.split('\n');
      lines.forEach((line, index) => {
        mapGenerator.addMapping({
          source: inputFilePath,
          original: {line: index+1+startLine, column: 0},
          generated: {line: index+3, column: 0}
        })
      });

      js += '__vue_script__ = (function(){' + script + '\n})();';
      js += imports;
    }

    // Template
    if (this.component.template) {
      let template = this.component.template.contents;

      js += '__vue_template__ = `' + template + '`;';

    }

    // Output
    js += `__vue_script__ = __vue_script__ || {};
    if(__vue_template__) {
      (typeof __vue_script__ === "function" ?
      (__vue_script__.options || (__vue_script__.options = {}))
      : __vue_script__).template = __vue_template__;
    }
    export default __vue_script__;`;

    // Babel options
    this.babelOptions.sourceMap = true;
    /*this.babelOptions.filename =
    this.babelOptions.sourceFileName = packageName
      ? "/packages/" + packageName + "/" + inputFilePath
      : "/" + inputFilePath;
    this.babelOptions.sourceMapTarget = this.babelOptions.filename + ".map";*/

    // Babel
    let output = Babel.compile(js, this.babelOptions);
    //console.log('---code:', output.code, '---map:', output.map);

    // Source Map
    /*var consumer = new sourcemap.SourceMapConsumer(output.map);
    var generator = sourcemap.SourceMapGenerator.fromSourceMap(consumer);
    generator.setSourceContent(this.inputFile.getSourceHash(), this.inputFile.getContentsAsString());
    var map = generator.toJSON();*/
    //var map = output.map;
    var map = mss.transfer({
      fromSourceMap: output.map,
      toSourceMap: mapGenerator.toJSON()
    });
    map.file = inputFilePath + '.map';
    map.sources = [inputFilePath];
    map.sourcesContent = [source];

    //console.log('---map2:', map);

    return {
      code: output.code,
      map
    };
  }

  throwCompileError(message, overrideIndex) {
    throwCompileError(this.tag, message, overrideIndex);
  }
}
