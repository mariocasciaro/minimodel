var utils = require('../utils'),
  Errors = require('../errors');

module.exports = Field;


function Field(descriptor, model) {
  if (!(this instanceof Field))
    return new Field(descriptor, model);

  this.value = undefined;
  this.model = model;
  this.descriptor = descriptor;
  this.validators = [];
  
  if(descriptor.get) {
    this._get = utils.bind(descriptor.get, this);
  }

  if(descriptor.set) {
    this._set = utils.bind(descriptor.set, this);
  }
  
  if(descriptor.cast) {
    this._cast = utils.bind(descriptor.cast, this);
  }
  
  if(descriptor.validate) {
    this.customValidator = descriptor.validate;
  }
  
  if(descriptor.required) {
    this.validators.push(this._validateRequired);
  }
}

Field.prototype._validateRequired = function() {
  if(this.value === void 0 || this.value === null || isNaN(this.values)) {
    return new Errors.FieldValidationError("required");
  }
};

Field.prototype.setDefault = function() {
  if(this.value === void 0 && this.descriptor.default !== void 0) {
    this.set(utils.getValue(this.descriptor.default, this));
  }
};

Field.prototype.get = function() {
  return this._get();
};

Field.prototype.set = function(val) {
  val = this._cast(val);
  this._set(val);
};

Field.prototype.setRaw = Field.prototype._set = function(val) {
  this.value = val;
};

Field.prototype.getRaw = Field.prototype._get = function() {
  return this.value;
};

Field.prototype.validate = function() {
  for(var i = 0; i < this.validators.length; i++) {
    var err = this.validators[i].call(this);
    if(err) {
      return err;
    }
  }
  return this.customValidator && this.customValidator.call(this);
};

Field.prototype._cast = function(val) {
  return val;
};

Field.prototype.includeInObject = function() {
  return this.descriptor.includeInObject === void 0 || utils.getValue(this.descriptor.includeInObject, this);
};

Field.prototype.includeInJson = function() {
  return this.descriptor.includeInJson === void 0 || utils.getValue(this.descriptor.includeInJson, this);
};

Field.prototype.includeInDb = function() {
  return this.descriptor.includeInDb === void 0 || utils.getValue(this.descriptor.includeInDb, this);
};