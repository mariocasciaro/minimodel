
# Synopsis

Minimal, database agnostic Models for Node.js and the Browser. 

The idea is to implement a Domain Model System that is totally database agnostic, 
so no `save()`, no `retrieve()`, no complex way to build relationships are provided.
This module is ideal if you have a service/DAO layer and you want to have models for just validation, 
type checking/casting, transformations etc.

Ideally, since the Models are not responsible for persistence (and do not contain any logic related to persistance)
 it shold be easier to share the models between server and client.

Features:
  * Define schemas with a syntax similar to Mongoose's
  * Type checking/casting
  * Defaults
  * Validation
  * Virtuals
  * Custom getters/setters

[![NPM](https://nodei.co/npm/minimodel.png?downloads=true)](https://nodei.co/npm/minimodel/)

[![Build Status](https://travis-ci.org/mariocasciaro/minimodel.png)](https://travis-ci.org/mariocasciaro/minimodel) [![Dependency Status](https://david-dm.org/mariocasciaro/minimodel.png)](https://david-dm.org/mariocasciaro/minimodel)

[![browser support](http://ci.testling.com/mariocasciaro/minimodel.png)](http://ci.testling.com/mariocasciaro/minimodel)

# Stability

**Experimental**: use at your own risk

## Usage

```javascript
var minimodel = require('minimodel');

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
      this.setRaw(new Date());
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

```

# More to come...

---
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/mariocasciaro/minimodel/trend.png)](https://bitdeli.com/free "Bitdeli Badge")