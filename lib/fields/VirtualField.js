var Field = require('./Field'),
  utils = require('../utils.js'),
  inherits = require('inherits');

module.exports = VirtualField;

inherits(VirtualField, Field);

function VirtualField(descriptor, model) {
  if (!(this instanceof VirtualField))
    return new VirtualField(descriptor, model);

  Field.call(this, descriptor, model);
}

VirtualField.prototype.setRaw = VirtualField.prototype._set = function(val) {
};

VirtualField.prototype.getRaw = VirtualField.prototype._get = function() {
};

//By default do not include Virtuals
VirtualField.prototype.includeInObject = function() {
  return this.descriptor.includeInObject !== void 0 || utils.getValue(this.descriptor.includeInObject, this);
};

VirtualField.prototype.includeInJson = function() {
  return this.descriptor.includeInJson !== void 0 || utils.getValue(this.descriptor.includeInJson, this);
};

VirtualField.prototype.includeInDb = function() {
  return this.descriptor.includeInDb !== void 0 || utils.getValue(this.descriptor.includeInDb, this);
};