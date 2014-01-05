var inherits = require('inherits'),
  extend = require('extend'),
  utils = require('./utils'),
  Errors = require('./errors'),
  Field = require('./fields/Field');


//#######################################################
//      MODEL  STATIC
//#######################################################

/**
 * Creates a new model
 *
 * @param schema The descriptor
 * @param obj The object to initialize the model instance
 * @param typedSchema The typed schema (the instantiation of the descriptor, containing Field classes),
 * if empty it will be automatically calculated
 * @param options
 * @returns {Model}
 * @constructor
 */
var Model = function(schema, obj, typedSchema, options) {
  if (!(this instanceof Model))
    return new Model(schema, obj);

  this.options = options || {};
  this.self = Model;
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
      Model._defineProperty(this, this, prop);
    }
  }

  this.set(obj);

  if(!this.options.doNotSetDefaults) {
    this.setDefault();
  }
};


/**
 * Given a normalized descriptor, it returns the proper Field class for the specified type, undefined otherwise.
 * @param descriptor
 * @returns {*}
 * @private
 */
Model._getField = function(descriptor) {
  if(!descriptor || !descriptor.type) {
    return undefined;
  }

  for(var i = 0; i < Model.FIELDS.length; i++) {
    var type = Model.FIELDS[i];
    if(type.isTypeOf(descriptor)) {
      return type;
    }
  }
  return undefined;
};

Model.FIELDS = [
  require('./fields/BooleanField'),
  require('./fields/StringField'),
  require('./fields/NumberField'),
  require('./fields/DateField'),
  require('./fields/ArrayField')
];


/**
 * Transform a schema descriptor to a schema having Fields and Models as properties.
 *
 * @param schema
 * @returns {{normalized: {}, typed: {}}}
 * @private
 */
Model._parseSchema = function(schema) {
  //parse the schema
  var schemas = {
    normalized: {},
    typed: {}
  };
  
  for(var prop in schema) {
    if(schema.hasOwnProperty(prop)) {
      var parsedField = Model._parseField(schema[prop]);
      if(!parsedField) {
        throw new Error("Invalid field type: " + prop);
      }
      schemas.normalized[prop] = parsedField.normalized;
      schemas.typed[prop] = parsedField.typed;
    }
  }
  return schemas;
};


Model._instantiateType = function(descriptor, type, parent) {
  if(utils.isSubclass(type, Model)) {
    //we set defaults later, when we have a full data object
    return new type(undefined, {parent: parent, doNotSetDefaults: true});
  } else {
    return new type(descriptor, parent || this);
  }
};

/**
 * Given an name and a field descriptor, it returns an object in the form {typed: <>, normalized: <>}
 * where "typed" is the actual parsed Field, and "normalized" is the normalized descriptor in the form {type: <>, ...}
 *
 * @param desc
 * @returns {{}}
 * @private
 */
Model._parseField = function(desc) {
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
  
  return undefined;
};


Model._defineProperty = function(target, context, prop) {
  Object.defineProperty(target, prop, {
    get: function() {
      return context.get(prop);
    },
    set: function(val) {
      return context.set(prop, val);
    },
    enumerable : true
  });
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

/**
 * Instantiate the typed schema creating actual objects out of the typed schema.
 *
 * @param schema Raw normalized descriptor
 * @param typedSchema Typed schema
 * @returns {} The instantiated schema
 * @private
 */
Model.prototype._instantiateSchema = function(schema, typedSchema) {
  var data = {};
  for(var prop in typedSchema) {
    if(typedSchema.hasOwnProperty(prop)) {
      data[prop] = Model._instantiateType(schema[prop], typedSchema[prop], this.parent || this);
    }
  }
  return data;
};

/**
 * Force all the Fields in the data to set their default value
 */
Model.prototype.setDefault = function() {
  for(var prop in this.data) {
    if(this.data.hasOwnProperty(prop)) {
      this.data[prop].setDefault();
    }
  }
};

/**
 * Recursively invoke a get method on the path specified
 *
 * @param method can be "get" or "getRaw"
 * @param path
 * @returns the value of the property
 * @private
 */
Model.prototype._genericGet = function(method, path) {
  var self = this;
  if(!path) {
    if(method === 'get') {
      return this._export('all', true);
    }

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

/**
 * Recursively invoke set until it reaches the property specified in the path.
 *
 * @param method one between "set" and "setRaw"
 * @param path
 * @param val
 * @private
 */
Model.prototype._genericSet = function(method, path, val) {
  var self = this;
  if(!path) {
    return;
  }

  if(typeof path == 'string') {
    var paths = path.split('.');
    if(paths.length > 1) {
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

/**
 * Exports the data in this model, in Object format
 *
 * @param where one between "all", "Object", "Json", "Db"
 * @param bound If true, it will create an object with each property bound to this model's properties
 * (two way binding). Otherwise it will just create a copy of the data in this model.
 *
 * @returns {{}}
 * @private
 */
Model.prototype._export = function(where, bound) {
  var includeCheck = "includeIn" + where;
  var obj = {};

  for(var key in this.data) {
    if(this.data.hasOwnProperty(key)) {
      var field = this.data[key];
      if(where === "all" || !field[includeCheck] || field[includeCheck]()) {
        if(bound) {
          Model._defineProperty(obj, this, key);
        } else {
          obj[key] = field._export(where, bound);
        }
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
  var ExtendedModel = function(obj, options) {
    if (!(this instanceof ExtendedModel))
      return new ExtendedModel(obj, options);

    Model.call(this, ExtendedModel.schemas.normalized, obj, ExtendedModel.schemas.typed, options);
  };

  inherits(ExtendedModel, Model);

  ExtendedModel.schemas = Model._parseSchema(schema);

  /**
   * Define a property programmatically
   *
   * @param name
   * @param descriptor
   */
  ExtendedModel.property = function(name, descriptor) {
    var propPath = name.split('.');
    if(propPath.length > 1) {
      ExtendedModel.schemas.typed[propPath[0]].property(propPath.slice(1).join("."), descriptor);
    } else {
      var parsedField = Model._parseField(descriptor);

      ExtendedModel.schemas.normalized[name] = parsedField.normalized;
      ExtendedModel.schemas.typed[name] = parsedField.typed;
    }
  };

  return ExtendedModel;
};


module.exports = Model;