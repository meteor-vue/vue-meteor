import crypto from 'crypto';

FileHash = function(inputFile) {
  let filePath = inputFile.getPackageName() + ':' + inputFile.getPathInPackage();
  return Hash(filePath);
}

Hash = function(text) {
  let hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}
