var inherits = require('inherits');

var self = module.exports = {
  FieldValidationError: FieldValidationError,
  ModelValidationError: ModelValidationError,
  
  messages: {
    "en-us": {
      "generic": "Failed to validate field",
      "required": "The field is required",
      "wrong_type": "Field value is not of type {type}"
    }
  },
  
  getMessage: function(type, params, lang) {
    lang = lang || "en-us";
    return self.messages[lang][type].replace(/\${([\w:]+)}/g, function(match, varname) {
      return params[varname];
    });
  }
};




function FieldValidationError(type, params) {
  this.type = type || 'generic';
  this.params = params;
  
  Error.call(this, self.getMessage(type, params));
}
inherits(FieldValidationError, Error);



function ModelValidationError(errors) {
  this.errors = errors;
  Error.call(this, "Error validating the model \n"+JSON.stringify(errors));
}
inherits(ModelValidationError, Error);