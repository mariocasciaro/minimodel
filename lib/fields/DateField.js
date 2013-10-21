var Field = require('./Field'),
  utils = require('../utils'),
  Errors = require('../errors'),
  inherits = require('inherits');

module.exports = DateField;

inherits(DateField, Field);

function DateField(descriptor, model) {
  if (!(this instanceof DateField))
    return new DateField(descriptor, model);

  Field.call(this, descriptor, model);
  
  this.validators.push(this._validateIsValidDate);
}

DateField.isTypeOf = function(descriptor) {
  return descriptor.type === Date;
};


DateField.prototype._validateIsValidDate = function() {
  if(this.value && isNaN(this.value.getTime())) {
    return new Errors.FieldValidationError("wrong_type", {type: "Date"});
  }
};

DateField.prototype._cast = function(val) {
  if(val) {
    var date =  new Date(val);
    if(isNaN(date.getTime()) && utils.isString(val)) {
      //try to convert to int
      return new Date(parseInt(val, 10));
    }
    return date;
  }
  return val;
};

