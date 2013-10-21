var Field = require('./Field'),
  utils = require('../utils'),
  Errors = require('../errors'),
  inherits = require('inherits');

module.exports = NumberField;

inherits(NumberField, Field);

function NumberField(descriptor, model) {
  if (!(this instanceof NumberField))
    return new NumberField(descriptor, model);

  Field.call(this, descriptor, model);
  
  this.validators.push(this._validateIsValidNumber);
}

NumberField.isTypeOf = function(descriptor) {
  return descriptor.type === Number;
};


NumberField.prototype._validateIsValidNumber = function() {
  if(this.value && isNaN(this.value.getTime())) {
    return new Errors.FieldValidationError("wrong_type", {type: "Number"});
  }
};

NumberField.prototype._cast = function(val) {
  if(!utils.isNumber(val)) {
    return parseFloat(val);
  }
  return val;
};
