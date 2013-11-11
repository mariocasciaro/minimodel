

module.exports.Model = require('./Model');
module.exports.ModelsArray = require('./ModelsArray');

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