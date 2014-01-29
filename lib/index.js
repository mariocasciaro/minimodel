

module.exports.Model = require('./Model');
module.exports.define = require('./Model').extend;
module.exports.ModelsArray = module.exports.Collection = require('./ModelsArray');



module.exports.Types = {
  String: require('./fields/StringField'),
  Number: require('./fields/NumberField'),
  Boolean: require('./fields/BooleanField'),
  Date: require('./fields/DateField'),
  Array: require('./fields/ArrayField'),
  Virtual: require('./fields/VirtualField'),
  Any: require('./fields/Field')
};

module.exports.Errors = require('./errors');
