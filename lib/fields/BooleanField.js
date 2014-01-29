var Field = require('./Field'),
  utils = require('../utils'),
  Errors = require('../errors'),
  inherits = require('inherits');

module.exports = BooleanField;

inherits(BooleanField, Field);

function BooleanField(descriptor, model) {
  if (!(this instanceof BooleanField))
    return new BooleanField(descriptor, model);

  Field.call(this, descriptor, model);
  
  this.validators.push(this._validateIsValidBoolean);
}

BooleanField.isTypeOf = function(descriptor) {
  return descriptor.type ===  Boolean;
};


BooleanField.prototype._validateIsValidBoolean = function(done) {
  if(this.value !== void 0 && typeof this.value !== 'boolean') {
    return done(new Errors.ValidationError("wrong_type", {type: "Boolean"}));
  }
  done();
};

BooleanField.prototype._cast = function(val) {
  if(utils.isString(val)) {
    switch(val.toLowerCase()) {
      case "false": 
      case "no": 
      case "0": 
      case "": 
        return false;
      case "true":
      case "yes":
      case "1":
        return true;
      default:
        return undefined;
    }
  }
  if(typeof val === 'boolean') {
    return val;
  }
  
  if(utils.isNumber(val)) {
    return !!val;
  }
  
  return undefined;
};
