var minimodel = require('../../lib');

var Post = minimodel.Model.extend({
  id: {
    //the field is a String
    type: String,
    //the field is required
    required: true
  },
  createdDate: {
    type: Date,
    //set the default (can be a value or a function)
    default: function() {
      //the execution context is the field itself
      return new Date();
    }
  },
  visits: {
    type: Number,
    default: 0,
    //do not include during object export using toJson()
    includeInJson: false
    //other options include
    //includeInObject: false
    //includeInDb: false
  },
  //a nested object
  author: {
    //shortcut to define a field
    name: String,
    surname: String,
    fullname: {
      //Virtuals are by default not exported (e.g. using toObject())
      //Virtuals do not have any default getter/setter, neet to define them explicitly
      type: minimodel.Types.Virtual,
      //a custom getter
      get: function() {
        return this.model.author.name + " " + this.model.author.surname;
      },
      //a custom setter
      set: function(val) {
        var parts = val.split(' ');
        this.model.setRaw({
          author: {
            name: parts[0],
            surname: parts[1]
          }
        });
      }
    }
  }
});

//create a post
var post = new Post({
  id: Date.now(),
  author: {
    fullname: "John Doe"
  }
});

//set a field after creation
post.set('author.name', 'Joe');
//or
post.author.name = 'Johnny'

//get a field
console.log(post.get('author.fullname'));
//or
console.log(post.author.name);