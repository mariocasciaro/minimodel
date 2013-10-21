

module.exports.Model = require('./Model');

module.exports.Types = {
  String: require('./fields/StringField'),
  Number: require('./fields/NumberField'),
  Date: require('./fields/DateField'),
  Virtual: require('./fields/VirtualField'),
  Any: require('./fields/Field')
};

module.exports.Errors = require('./errors');