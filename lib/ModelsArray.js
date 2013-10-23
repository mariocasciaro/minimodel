var inherits = require('inherits');

module.exports = ModelsArray;

function ModelsArray() {
  Array.apply(this, arguments);
}

inherits(ModelsArray, Array);


ModelsArray.prototype.toJson = function() {
  return this.map(function(elem) {
    return elem.toJson();
  });
};

ModelsArray.prototype.toDb = function() {
  return this.map(function(elem) {
    return elem.toDb();
  });
};

ModelsArray.prototype.toObject = function() {
  return this.map(function(elem) {
    return elem.toObject();
  });
};