[![NPM version](https://badge.fury.io/js/minimodel.png)](http://badge.fury.io/js/minimodel)
[![Build Status](https://travis-ci.org/mariocasciaro/minimodel.png)](https://travis-ci.org/mariocasciaro/minimodel)
[![Coverage Status](https://coveralls.io/repos/mariocasciaro/minimodel/badge.png)](https://coveralls.io/r/mariocasciaro/minimodel)
[![Dependency Status](https://gemnasium.com/mariocasciaro/minimodel.png)](https://gemnasium.com/mariocasciaro/minimodel)

[![browser support](https://ci.testling.com/mariocasciaro/minimodel.png)](http://ci.testling.com/mariocasciaro/minimodel)

# Minimodel

Minimal, database agnostic Models for Node.js and the Browser. 

The idea is to implement a Domain Model System that is persitence agnostic, to be used only for validation, type casting, transormations, and business logic. By using `minimodel`, persintence (if relevant) has to be delegated to an external component (e.g. DAO/Services).

__Advantages__

* The same model can be retrieved from different data sources 
* Easily reuse the same models in the Browser
* Custom persitence allows more fine grained and powerful queries (instead of using an imposed ORM style querying system)

__Features__
  * Define schemas with a syntax similar to Mongoose's
  * Type checking/casting
  * Defaults
  * Validation
  * Virtuals
  * Custom getters/setters

## Usage

```javascript
var minimodel = require('minimodel');

var Post = minimodel.define({
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

## Stability

**1 - Experimental**

Please try it out and provide feedback.

## What's new

#### 0.2

* **Breaking changes**:
    * `validate()` is now an async function. A callback could be given as argument otherwise a promise will be returned.
