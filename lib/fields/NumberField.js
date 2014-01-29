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


NumberField.prototype._validateIsValidNumber = function(done) {
  if(this.value !== void 0 && isNaN(this.value)) {
    return done(new Errors.ValidationError("wrong_type", {type: "Number"}));
  }
  done();
};

NumberField.prototype._cast = function(val) {
  if(!utils.isNumber(val)) {
    return parseFloat(val);
  }
  return val;
};
