module.exports.getFileMode = function() {
  return Oden.lstatSync(__dirname + "/exec").mode;
};
