import fs from 'fs';
import path from 'path';
import { Meteor } from 'meteor/meteor';
import hash from 'hash-sum';

FileHash = function(inputFile) {
  let filePath = inputFile.getPackageName() + ':' + inputFile.getPathInPackage();
  return Hash(filePath);
}

Hash = function(text) {
  return hash(text)
}

normalizeCarriageReturns = function(contents, str = "\n") {
  return contents.replace(rnReg, str).replace(rReg, str);
}

getFullDirname = function(inputFile) {
  const packageName = inputFile.getPackageName();
  return (packageName? packageName + '/' : '') + inputFile.getDirname();
}

getFullPathInApp = function(inputFile) {
  const packageName = inputFile.getPackageName();
  return (packageName? packageName + '/' : '') + inputFile.getPathInPackage();
}

getFilePath = function(inputFile) {
  const sourceRoot = Plugin.convertToOSPath(inputFile._resourceSlot.packageSourceBatch.sourceRoot);
  return path.resolve(sourceRoot, inputFile.getPathInPackage());
}

isDevelopment = function() {
  return Meteor.isDevelopment;
}

getLineNumber = function(contents, charIndex) {
  const text = normalizeCarriageReturns(contents.substring(0, charIndex));
  return text.split('\n').length;
}

getLineInInputFile = function(inputFile, charIndex) {
  return getLineNumber(inputFile.getContentsAsString(), charIndex);
}

throwCompileError = function throwCompileError({
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
  showError = false,
  showStack = false
}) {
  let output = '[vue-component] Error';

  // Action
  if(action) {
    output += ' while ' + action;
  }

  // Tag
  if(tag) {
    output += ' in tag <' + tag + '>';
  }

  // Lang
  if(lang) {
    output += ' using lang ' + lang;
  }

  // Message
  if(message) {
    if(action) {
      output += ': ';
    } else {
      output += ' ';
    }

    output += message;
  }

  let errMsg = `${output}`;

  // Error location

  if(path) {
    output += ' -> in ' + path;
  } else if(inputFile) {
    output += ' -> in ' + getFullPathInApp(inputFile);
  } else {
    output += ' (unknown source file)';
  }

  let lineNumber = line;
  if(charIndex && inputFile) {
    const lineResult = getLineInInputFile(inputFile, charIndex)-1;
    if(lineNumber) {
      lineNumber += lineResult;
    } else {
      lineNumber = lineResult;
    }
  }
  if(lineNumber) {
    output += ' at line ' + lineNumber;
  }

  if(column) {
    output += ' col ' + column;
  }

  // Stack
  if(showStack && error && error.stack) {
    ouput += '\n' + error.stack;
  }

  console.error(output);

  // Native error
  if(showError) {
    console.error(error);
  }

  let err = new Error(errMsg);
  err.line = lineNumber;
  throw err;
}
