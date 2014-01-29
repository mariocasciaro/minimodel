var utils = require('../utils'),
  async = require('async'),
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
    this.validators.push(descriptor.validate);
  }
  
  if(descriptor.required) {
    this.validators.push(this._validateRequired);
  }
}

Field.prototype._validateRequired = function(done) {
  if(this.value === void 0 || this.value === null) {
    done(new Errors.ValidationError("required"));
  } else {
    done();
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

/**
 * Do not override
 */
Field.prototype.validate = function(callback) {
  var self = this;
  
  var functs = this.validators ? this.validators.map(function(v) {
    return function(cb) {
      v.call(self, function(err) {
        //pass err as result
        cb(null, err);
      });
    };
  }) : [];
  
  async.parallel(functs, function(err, results) {
    var errors = results.filter(function(r) {
      return !!r;
    });
    if(errors.length > 0) {
      callback(new Errors.FieldValidationError(errors));
    } else {
      callback();
    }
  });
};

Field.prototype._cast = function(val) {
  return val;
};

Field.prototype._export = function(where, bound) {
  return this.get();
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
