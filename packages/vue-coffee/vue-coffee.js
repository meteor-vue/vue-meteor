// Used some code from https://github.com/meteor/meteor/blob/devel/packages/coffeescript/plugin/compile-coffeescript.js

global.vue = global.vue || {}
global.vue.lang = global.vue.lang || {}


import sourcemap from "source-map";
import coffee from "coffee-script";
import {
  ECMAScript
} from "meteor/ecmascript";
import {
  Meteor
} from 'meteor/meteor';

global.vue.lang.coffee = Meteor.wrapAsync(function({
  source,
  inputFile
}, cb) {

  const compileOptions = {
    bare: true,
    filename: inputFile.getPathInPackage(),
    // Return a source map.
    sourceMap: true,
    // Include the original source in the source map (sourcesContent field).
    inline: true,
    // This becomes the "file" field of the source map.
    generatedFile: "/" + outputFilePath(inputFile),
    // This becomes the "sources" field of the source map.
    sourceFiles: [inputFile.getDisplayPath()]
  };

  let output = coffee.compile(source, compileOptions);

  if (source.indexOf('`') !== -1) {
    // If source contains backticks, pass the coffee output through ecmascript
    try {
      output.js = ECMAScript.compileForShell(output.js);
    } catch (e) {}
  }

  const stripped = stripExportedVars(
    output.js,
    inputFile.getDeclaredExports().map(e => e.name));
  const sourceWithMap = addSharedHeader(
    stripped, JSON.parse(output.v3SourceMap));

  cb(null, {
    script: sourceWithMap.source,
    map: sourceWithMap.sourceMap,
    useBabel: false
  });
});


function outputFilePath(inputFile) {
  return inputFile.getPathInPackage() + ".js";
}

function stripExportedVars(source, exports) {
  if (!exports || !exports.length)
    return source;
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /^var (.+)([,;])$/.exec(line);
    if (!match)
      continue;

    // If there's an assignment on this line, we assume that there are ONLY
    // assignments and that the var we are looking for is not declared. (Part
    // of our strong assumption about the layout of this code.)
    if (match[1].indexOf('=') !== -1)
      continue;

    // We want to replace the line with something no shorter, so that all
    // records in the source map continue to point at valid
    // characters.
    function replaceLine(x) {
      if (x.length >= lines[i].length) {
        lines[i] = x;
      } else {
        lines[i] = x + new Array(1 + (lines[i].length - x.length)).join(' ');
      }
    }

    let vars = match[1].split(', ').filter(v => exports.indexOf(v) === -1);
    if (vars.length) {
      replaceLine("var " + vars.join(', ') + match[2]);
    } else {
      // We got rid of all the vars on this line. Drop the whole line if this
      // didn't continue to the next line, otherwise keep just the 'var '.
      if (match[2] === ';')
        replaceLine('');
      else
        replaceLine('var');
    }
    break;
  }

  return lines.join('\n');
}

function addSharedHeader(source, sourceMap) {
  // This ends in a newline to make the source map easier to adjust.
  const header = ("__coffeescriptShare = typeof __coffeescriptShare === 'object' " +
    "? __coffeescriptShare : {}; " +
    "var share = __coffeescriptShare;\n");

  // If the file begins with "use strict", we need to keep that as the first
  // statement.
  const processedSource = source.replace(/^(?:((['"])use strict\2;)\n)?/, (match, useStrict) => {
    if (match) {
      // There's a "use strict"; we keep this as the first statement and insert
      // our header at the end of the line that it's on. This doesn't change
      // line numbers or the part of the line that previous may have been
      // annotated, so we don't need to update the source map.
      return useStrict + "  " + header;
    } else {
      // There's no use strict, so we can just add the header at the very
      // beginning. This adds a line to the file, so we update the source map to
      // add a single un-annotated line to the beginning.
      sourceMap.mappings = ";" + sourceMap.mappings;
      return header;
    }
  });
  return {
    source: processedSource,
    sourceMap: sourceMap
  };
}
