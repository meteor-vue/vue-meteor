VueComponentCompiler = class VueComponentCompiler extends MultiFileCachingCompiler {
  constructor() {
    super({
      compilerName: 'vuecomponent',
      defaultCacheSize: 1024 * 1024 * 10,
    });

    this.babelOptions = Babel.getDefaultOptions();
  }
  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }
  compileResultSize(compileResult) {
    return compileResult.code.length + compileResult.map.length;
  }
  compileOneFile(inputFile, allFiles) {
    const contents = inputFile.getContentsAsString();
    const inputPath = inputFile.getPathInPackage();

    try {
      const tags = scanHtmlForTags({
        sourceName: inputPath,
        contents: contents,
        tagNames: ['template', 'script', 'style']
      });

      return {
        compileResult: compileTags(inputFile, tags, this.babelOptions),
        referencedImportPaths: []
      };
    } catch (e) {
      if (e instanceof CompileError) {
        inputFile.error({
          message: e.message,
          line: e.line
        });
        return null;
      } else {
        throw e;
      }
    }
  }
  addCompileResult(inputFile, compileResult) {

    if (compileResult.styles.length !== 0) {
      let css = '';
      for (let style of compileResult.styles) {
        css += style.css;
      }
      addStylesheet(inputFile, {
        data: css
      });
    }


    inputFile.addJavaScript({
      path: inputFile.getPathInPackage() + '.js',
      sourcePath: inputFile.getPathInPackage(),
      data: compileResult.code,
      sourceMap: compileResult.map
    });
  }
}

function compileTags(inputFile, tags, babelOptions) {
  var handler = new VueComponentTagHandler({ inputFile, babelOptions });

  tags.forEach((tag) => {
    handler.addTagToResults(tag);
  });

  return handler.getResults();
}

function addStylesheet(inputFile, options) {
  const data = options.data.replace(new RegExp("\r\n", "g"), "\n").replace(new RegExp("\r", "g"), "\n");
  inputFile.addStylesheet({
    path: inputFile.getPathInPackage() + '.css',
    sourcePath: inputFile.getPathInPackage(),
    data: data,
    sourceMap: options.map
  });
}

function cssToCommonJS(css) {
  css = css.replace(/\n/g, '"+\n"');
  return 'module.exports = require("meteor/modules").addStyles("' + css + '");';
}
