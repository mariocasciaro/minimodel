var Field = require('./Field'),
  Errors = require('../errors'),
  utils = require('../utils'),
  inherits = require('inherits');

module.exports = StringField;

inherits(StringField, Field);

function StringField(descriptor, model) {
  if (!(this instanceof StringField))
    return new StringField(descriptor, model);

  Field.call(this, descriptor, model);
  
  this.validators.push(this._validateIsString);
  if(descriptor.required) {
    this.validators.push(this._validateIsRequiredString);
  }
}

StringField.isTypeOf = function(descriptor) {
  return descriptor.type === String;
};


StringField.prototype._validateIsString = function(done) {
  if(this.value && !utils.isString(this.value)) {
    return done(new Errors.ValidationError("wrong_type", {type: "String"}));
  }
  done();
};

StringField.prototype._validateIsRequiredString = function(done) {
  if(utils.isEmpty(this.value)) {
    return done(new Errors.ValidationError("required"));
  }
  done();
};

StringField.prototype._cast = function(val) {
  if(val) {
    return val.toString();
  }
  return val;
};


