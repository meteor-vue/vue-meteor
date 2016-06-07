import path from 'path';
import fs from 'fs';
import {exec} from 'child_process';
import {Meteor} from 'meteor/meteor';


CWD = path.resolve('./');

checkNpmDeps = function checkNpmDeps({dependencies, devDependencies}) {
  let pkg = {};
  const packageFile = path.join(CWD, 'package.json');

  if (fs.existsSync(packageFile)) {
    pkg = JSON.parse(fs.readFileSync(packageFile).toString());
  }

  if (!pkg.dependencies) {
    pkg.dependencies = {};
  }

  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }

  let hasChanged = false;

  if(dependencies) {
    for (let depName in dependencies) {
      if (isNpmPackageOlder(dependencies[depName], pkg.dependencies[depName])) {
        pkg.dependencies[depName] = dependencies[depName];
        hasChanged = true;
      }
    }
  }

  if(devDependencies) {
    for (let depName in devDependencies) {
      if (isNpmPackageOlder(devDependencies[depName], pkg.devDependencies[depName])) {
        pkg.devDependencies[depName] = devDependencies[depName];
        hasChanged = true;
      }
    }
  }

  if (hasChanged) {
    fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2));
  }

  return hasChanged;
}

function isNpmPackageOlder(depVersion, currentVersion) {
  if (!currentVersion) {
    return true;
  }

  const depVersions = depVersion.replace(/^[\^~]/, '').split('.');
  const currentVersions = currentVersion.replace(/^[\^~]/, '').split('.');

  for (let i = depVersions.length; i < 3; ++i) {
    depVersions.push('0');
  }

  for (let i = currentVersions.length; i < 3; ++i) {
    depVersions.push('0');
  }

  if (depVersions[0] > currentVersions[0]) {
    return true;
  } else if (depVersions[0] < currentVersions[0]) {
    return false;
  }

  if (depVersions[1] > currentVersions[1]) {
    return true;
  } else if (depVersions[1] < currentVersions[1]) {
    return false;
  }

  if (depVersions[2] > currentVersions[2]) {
    return true;
  } else if (depVersions[2] < currentVersions[2]) {
    return false;
  }

  return false;
}

execSync = Meteor.wrapAsync((...params) => {
    const cb = params.pop();
    exec(...params, (error, stdout, stderr) => {
        stdout && console.log(stdout.toString());
        stderr && console.error(stderr.toString());
        cb(error);
    });
});
