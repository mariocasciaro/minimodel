var inherits = require('inherits'),
  extend = require('extend'),
  utils = require('./utils'),
  Errors = require('./errors'),
  Field = require('./fields/Field');

module.exports = Model;


//#######################################################
//      MODEL  STATIC
//#######################################################


function Model(schema, obj, typedSchema, options) {
  if (!(this instanceof Model))
    return new Model(schema, obj);

  this.options = options || {};
  
  this.parent = this.options.parent;

  if(!typedSchema) {
    var schemas = Model._parseSchema(schema);
    this.typedSchema = schemas.typed;
    this.schema = schemas.normalized;
  } else {
    this.schema = schema;
    this.typedSchema = typedSchema;
  }
  
  //instantiate and initialize the data
  this.data = this._instantiateSchema(this.schema, this.typedSchema);
  
  //define properties
  //TODO make this optional?
  for(var prop in this.data) {
    if(this.data.hasOwnProperty(prop)) {
      this._defineProperty(prop);
    }
  }

  this.set(obj);

  if(!this.options.doNotSetDefaults) {
    this.setDefault();
  }
}



Model._getField = function(descriptor) {
  for(var i = 0; i < Model.FIELDS.length; i++) {
    var type = Model.FIELDS[i];
    if(type.isTypeOf(descriptor)) {
      return type;
    }
  }
  return undefined;
};

Model.FIELDS = [
  require('./fields/StringField'),
  require('./fields/NumberField'),
  require('./fields/DateField')
];


Model._parseSchema = function(schema) {
  //parse the schema
  var schemas = {
    normalized: {},
    typed: {}
  };
  
  for(var prop in schema) {
    if(schema.hasOwnProperty(prop)) {
      var parsedField = Model._assignField(prop, schema[prop]);
      schemas.normalized[prop] = parsedField.normalized;
      schemas.typed[prop] = parsedField.typed;
    }
  }
  return schemas;
};


Model._assignField = function(name, desc) {
  var field;
  var container = {};
  if(utils.isSubclass(desc, Field) || utils.isSubclass(desc, Model)) {
    container.typed = desc;
    container.normalized = {type: desc};
    return container;
  } 
  
  if(desc && (utils.isSubclass(desc.type, Field) || utils.isSubclass(desc.type, Model))) {
    container.typed = desc.type;
    container.normalized = desc;
    return container;
  } 
  
  field = Model._getField({type: desc});
  if(field) {
    container.typed = field;
    container.normalized = {type: desc};
    return container;
  }
  
  field = desc && Model._getField(desc);
  if(field) {
    container.typed = field;
    container.normalized = desc;
    return container;
  }
  
  //it's a nested object?
  if(!utils.isEmpty(desc)) {
    container.typed = Model.extend(desc);
    container.normalized = desc;
    return container;
  }
  
  throw new Error("Invalid field type: " + name);
};


//#######################################################
//      MODEL  PROTOTYPE
//#######################################################


Model.prototype.validate = function() {
  var errors = {};
  
  for(var prop in this.data) {
    if(this.data.hasOwnProperty(prop)) {
      var err = this.data[prop].validate();
      if(err) {
        errors[prop] = err;
      }
    }
  }
  
  if(!utils.isEmpty(errors)) {
    return new Errors.ModelValidationError(errors);
  }
  return undefined;
};


Model.prototype._defineProperty = function(prop) {
  var self = this;
  Object.defineProperty(this, prop, {
    get: function() {
      return self.get(prop);
    },
    set: function(val) {
      return self.set(prop, val);
    },
    enumerable : true
  });
};


Model.prototype.property = function(name, descriptor) {
  //TODO fix this
  Model._assignField(this.typedSchema, name, descriptor);
};


Model.prototype._instantiateSchema = function(schema, typedSchema) {
  var data = {};
  for(var prop in typedSchema) {
    if(typedSchema.hasOwnProperty(prop)) {
      var type = typedSchema[prop];
      if(utils.isSubclass(type, Model)) {
        //we set defaults later, when we have a full data object
        data[prop] = new type(undefined, {parent: this.parent || this, doNotSetDefaults: true});
      } else {
        data[prop] = new type(schema[prop], this.parent || this);
      }
    }
  }
  return data;
};


Model.prototype.setDefault = function() {
  for(var prop in this.data) {
    if(this.data.hasOwnProperty(prop)) {
      this.data[prop].setDefault();
    }
  }
};

Model.prototype._genericGet = function(method, path) {
  var self = this;
  if(!path) {
    //return this.toObject();
    return this;
  }

  var paths = path.split('.');
  if(paths.length > 1) {
    //TODO should we check for field type also?
    //is deep into another model
    return self.data[paths[0]] && self.data[paths[0]][method](paths.slice(1).join('.'));
  } else {
    return self.data[path] && self.data[path][method]();
  }
};


Model.prototype.get = function(path) {
  return this._genericGet('get', path);
};


Model.prototype.getRaw = function(path) {
  return this._genericGet('getRaw', path);
};

Model.prototype._genericSet = function(method, path, val) {
  var self = this;
  if(!path) {
    return;
  }

  if(typeof path == 'string') {
    var paths = path.split('.');
    if(paths.length > 1) {
      //TODO should we check for field type also?
      //is another model
      self.data[paths[0]] && self.data[paths[0]][method](paths.slice(1).join('.'), val);
    } else {
      self.data[path] && self.data[path][method](val);
    }
  } else {
    val = path;
    for(var prop in val) {
      if(val.hasOwnProperty(prop)) {
        self[method](prop, val[prop]);
      }
    }
  }
};

Model.prototype.set = function(path, val) {
  return this._genericSet('set', path, val);
};

Model.prototype.setRaw = function(path, val) {
  return this._genericSet('setRaw', path, val);
};

Model.prototype._export = function(where) {
  var self = this;
  var includeCheck = "includeIn" + where;
  var obj = {};

  for(var key in self.data) {
    if(self.data.hasOwnProperty(key)) {
      var field = self.data[key];
      if(!field[includeCheck] || field[includeCheck]()) {
        obj[key] = field.get();
      }
    }
  }

  return obj;
};


Model.prototype.toObject = function() {
  return this._export('Object');
};

Model.prototype.toDb = function() {
  return this._export('Db');
};

Model.prototype.toJson = function() {
  return this._export('Json');
};



//#######################################################
//      MODEL  EXTEND
//#######################################################


Model.extend = function(schema) {
  var schemas = Model._parseSchema(schema);

  function ExtendedModel(obj, options) {
    if (!(this instanceof ExtendedModel))
      return new ExtendedModel(obj, options);

    Model.call(this, schemas.normalized, obj, schemas.typed, options);
  }

  inherits(ExtendedModel, Model);

  return ExtendedModel;
};