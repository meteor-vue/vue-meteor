import { BabelCompiler } from 'meteor/babel-compiler';

Plugin.registerCompiler({
  extensions: ['routes.js'],
  archMatching: 'web'
}, () => new VueRouterCompiler());

class VueRouterCompiler extends CachingCompiler  {
  constructor() {
    super({
      compilerName: 'vue-router',
      defaultCacheSize: 1024*1024*10,
    });
  }

  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }

  compileResultSize(compileResult) {
    return compileResult.code.length + compileResult.map.length;
  }

  compileOneFile(inputFile) {
    let source = inputFile.getContentsAsString();
    let packageName = inputFile.getPackageName();
    let inputFilePath = inputFile.getPathInPackage();
    let sourcePath = packageName ? "/packages/" + packageName + "/" + inputFilePath : "/" + inputFilePath;

    let code = source;
    code = code.replace(jsExportDefaultReg, 'return');
    code = code.replace(componentReg, 'component: require($1).default');
    code = 'let r = (()=>{' + code + `})();
    import {Router} from 'meteor/akryum:vue-router';
    Router.map(r);`;
    console.log(code);
    let map = '';

    let babelOptions = Babel.getDefaultOptions();
    babelOptions.sourceMap = true;
    babelOptions.filename = babelOptions.sourceFileName = sourcePath;
    babelOptions.sourceMapTarget = babelOptions.filename + ".map";

    // Babel compilation
    let output = Babel.compile(code, babelOptions);
    code = output.code;
    map = output.map;

    return {
      code,
      map,
    }
  }

  addCompileResult(inputFile, compileResult) {
    let packageName = inputFile.getPackageName();
    let inputFilePath = inputFile.getPathInPackage();
    let sourcePath = packageName ? "/packages/" + packageName + "/" + inputFilePath : "/" + inputFilePath;

    inputFile.addJavaScript({
      path: sourcePath,
      sourcePath,
      data: compileResult.code,
      sourceMap: compileResult.map
    });
  }
}

const jsExportDefaultReg = /export\s+default/g;
const componentReg = /component:\s*((['"]).*?\2)/g
