
var expect = require('chai').expect,
  minimodel = require('../lib');


describe('set/get/cast', function() {
  var Post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      id: String,
      title: {
        type: String
      },
      nested: {
        type: {
          type: String
        },
        hello: String
      },
      nested2: {
        me: String,
        hello: String
      },
      asField: minimodel.Types.String
    });
  });


  it('should set/get a property from constructor', function() {
    var post = new Post({id: "blah"});
    expect(post.get('id')).to.be.equal('blah');
  });

  it('should set a property', function() {
    var post = new Post();
    post.set('id', "blah");
    expect(post.get('id')).to.be.equal('blah');
  });

  it('should cast a value to its actual type (generic test)', function() {
    var post = new Post({id: {}});
    expect(post.get('id')).to.be.equal('[object Object]');
  });

  it('should support nested properties', function() {
    var post = new Post({id: "blah", nested2: {me: "test", hello: "world"}});
    expect(post.get('nested2.me')).to.be.equal('test');
    expect(post.get('nested2.hello')).to.be.equal('world');
  });
  
  it('should support nested "type" property', function() {
    var post = new Post({id: "blah", nested: {type: "test", hello: "world"}});
    expect(post.get('nested.type')).to.be.equal('test');
    expect(post.get('nested.hello')).to.be.equal('world');
  });

  it('should retrieve entire nested objects', function() {
    var post = new Post({nested: {type: "test"}});
    expect(post.get('nested')).to.have.property('type', 'test');
  });

  it('should not set properties not in schema', function() {
    var post = new Post({id: "blah", type: "test"});
    expect(post.get('type')).to.not.exist;
  });

  it('should support Model/Fields as types', function() {
    var post = new Post({asField: 1});
    expect(post.get('asField')).to.be.equal('1');
  });
});


describe('handling wrong descriptors', function() {
  it('should throw exception for empty object', function() {
    expect(function() {
      minimodel.Model.extend({
        id: {}
      });
    }).to.throw(/Invalid field/);
  });

  it('should throw exception for undefined', function() {
    expect(function() {
      minimodel.Model.extend({
        id: undefined
      });
    }).to.throw(/Invalid field/);
  });

  it('should throw exception for undefined type', function() {
    expect(function() {
      minimodel.Model.extend({
        id: {
          type: undefined
        }
      });
    }).to.throw(/Invalid field/);
  });


  it('should throw exception for nested empty types', function() {
    expect(function() {
      minimodel.Model.extend({
        id: {
          type: {
            type: {
              type: {}
            }
          }
        }
      });
    }).to.throw(/Invalid field/);
  });
});

describe('access using properties', function() {
  var Post, post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      title: {
        type: String
      },
      nested: {
        type: {
          type: String
        }
      }
    });
    post = new Post({title: "blah", nested: {type: "test"}});
  });


  it('should get the value using property accessor', function() {
    expect(post.title).to.be.equal('blah');
  });

  it('should set the value using property accessor', function() {
    post.title = 'blah+';
    expect(post.title).to.be.equal('blah+');
  });

  it('should get entire nested objects using property accessor', function() {
    expect(post.nested).to.have.property('type','test');
  });

  it('should get the value of nested fields using property accessor', function() {
    expect(post.nested.type).to.be.equal('test');
  });

  it('should set the value of nested fields using property accessor', function() {
    post.nested.type = 'test+';
    expect(post.nested.type).to.be.equal('test+');
  });

  it('should set entire nested objects', function() {
    post.nested = {type: 'test+'};
    expect(post.nested.type).to.be.equal('test+');
  });
});

describe('field getters/setters', function() {

  it('should use the field getter to retrieve field value', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        get: function() {
          return this.getRaw() + "!"
        }
      }
    });

    var model = new TestModel();
    model.set('id', "ok");
    expect(model.get('id')).to.be.equal('ok!');
  });


  it('should use the field setter to set field value', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        set: function(val) {
          return this.setRaw(val + "!");
        }
      }
    });

    var model = new TestModel();
    model.set('id', "ok");
    expect(model.get('id')).to.be.equal('ok!');
  });
});


describe('Virtuals', function() {
  it('should not have default getters and setters', function() {
    var TestModel = minimodel.Model.extend({
      field: {
        type: minimodel.Types.Virtual
      }
    });

    var model = new TestModel();
    model.set('field', "ok");
    expect(model.get('field')).to.not.exist;
  });


  it('getters/setters should be able to access main model', function() {
    var TestModel = minimodel.Model.extend({
      full: {
        type: minimodel.Types.Virtual,
        get: function() {
          return this.model.get('name') + " " + this.model.get('surname');
        }
      },
      nested: {
        prop: {
          type: minimodel.Types.Virtual,
          get: function() {
            return this.model.get('name') + " " + this.model.get('surname');
          }
        }
      },
      name: String,
      surname: String
    });

    var model = new TestModel({name: "John", surname: "Doe"});
    expect(model.get('full')).to.be.equal('John Doe');
    expect(model.get('nested.prop')).to.be.equal('John Doe');
  });


  it('should not be exported', function() {
    var TestModel = minimodel.Model.extend({
      field: {
        type: minimodel.Types.Virtual,
        get: function() {
          return "ok";
        }
      }
    });

    var model = new TestModel();
    expect(model.toObject()).to.be.empty;
  });
});


describe('defaults', function() {
  var Post, post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      title: {
        type: String
      },
      nested: {
        type: {
          type: String,
          default: "ahahah"
        }
      },
      aField: {
        type: String,
        default: function() {
          return "mmm";
        }
      },
      anotherField: {
        type: String,
        default: "mmm"
      }
    });
    post = new Post({title: "blah", anotherField: "wha"});
  });


  it('should set default value if not specified in constructor', function() {
    expect(post.aField).to.be.equal('mmm');
    expect(post.nested.type).to.be.equal('ahahah');
  });
  
  it('should not set default value if it is specified in constructor', function() {
    expect(post.title).to.be.equal('blah');
    expect(post.anotherField).to.be.equal('wha');
  });
});


describe('Date field', function() {
  var Post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      date: Date
    });
  });
  
  it('should set date from string', function() {
    var post = new Post({date: "1372354005"});
    expect(post.date).to.be.instanceof(Date);
    expect(post.date.toString()).to.be.equal(new Date(1372354005).toString());
  });
  
  it('should set date from number', function() {
    var post = new Post({date: 1372354005});
    expect(post.date).to.be.instanceof(Date);
    expect(post.date.toString()).to.be.equal(new Date(1372354005).toString());
  });
});


describe('Number field', function() {
  var Post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      nr: Number
    });
  });
  
  it('should set number from string', function() {
    var post = new Post({nr: "7"});
    expect(typeof post.nr === 'number').to.be.true;
    expect(post.nr).to.be.equal(7);
  });
  
  it('should set number from number', function() {
    var post = new Post({nr: 7});
    expect(typeof post.nr === 'number').to.be.true;
    expect(post.nr).to.be.equal(7);
  });
});


describe('Boolean field', function() {
  var Post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      b: Boolean
    });
  });

  it('should set boolean from boolean', function() {
    var post = new Post({b: true});
    expect(typeof post.b).to.be.equal("boolean");
    expect(post.b).to.be.true;
  });

  it('should set boolean from string (true)', function() {
    var post = new Post({b: "true"});
    expect(typeof post.b).to.be.equal("boolean");
    expect(post.b).to.be.true;
  });

  it('should set boolean from string (false)', function() {
    var post = new Post({b: "false"});
    expect(typeof post.b).to.be.equal("boolean");
    expect(post.b).to.be.false;
  });

  it('should not set boolean from string if unknown value (string)', function() {
    var post = new Post({b: "falsee"});
    expect(post.b).to.be.undefined;
  });

  it('should not set boolean from string if unknown value (obj)', function() {
    var post = new Post({b: {}});
    expect(post.b).to.be.undefined;
  });

  it('should validate if a bool', function() {
    var post = new Post({b: true});
    expect(post.validate()).to.be.undefined;
  });
});

describe('Validators', function() {
  it('should not validate if empty value and required is set', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        required: true
      }
    });
    
    var model = new TestModel({});
    expect(model.id).to.not.exist;
    expect(model.validate()).to.be.instanceof(minimodel.Errors.ModelValidationError);
    expect(model.validate()).to.have.deep.property("errors.id.type", "required");
  });
  
  
  it('should not validate if empty string and required is set', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        required: true
      }
    });
    
    var model = new TestModel({id: ""});
    expect(model.validate()).to.have.deep.property("errors.id.type", "required");
  });
  
  
  it('should not validate if date is not valid date', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: Date
      }
    });
    
    var model = new TestModel({id: "asdqweasd"});
    expect(model.validate()).to.have.deep.property("errors.id.type", "wrong_type");
  });
  
  
  it('should not validate if number is NaN', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: Number
      }
    });
    
    var model = new TestModel({id: "asdqweasd"});
    expect(model.validate()).to.have.deep.property("errors.id.type", "wrong_type");
  });
  
  
  it('should not validate if custom validation fail', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        validate: function() {
          if(this.value.length < 2) {
            return new Error("Custom validation failed");
          }
        }
      }
    });
    
    var model = new TestModel({id: "a"});
    expect(model.validate()).to.have.deep.property("errors.id");
  });


  it('should return a meaningful error message', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        required: true
      }
    });

    var model = new TestModel({id: ""});
    expect(model.validate().message).to.contain("The field is required");
  });
});


describe('Exporters', function() {

  it('should export all concrete fields', function() {
    var Post = minimodel.Model.extend({
      nr: Number,
      nested: {
        obj: String
      }
    });
    var post = new Post({nr: "7", nested: {obj: "a"}});
    expect(post.toJson()).to.have.property('nr', 7);
    expect(post.toObject()).to.have.property('nr', 7);
    expect(post.toObject()).to.have.deep.property('nested.obj', "a");
    expect(post.toDb()).to.have.property('nr', 7);
  });
  
  it('should not export virtuals by default', function() {
    var Post = minimodel.Model.extend({
      nr: Number,
      v: {
        type: minimodel.Types.Virtual,
        get: function() {
          return "1";
        }
      }
    });
    var post = new Post({nr: "7"});
    expect(post.toJson()).to.not.have.property('v');
    expect(post.toObject()).to.not.have.property('v');
    expect(post.toDb()).to.not.have.property('v');
  });
  
  it('exported objects should not modify Model', function() {
    var Post = minimodel.Model.extend({
      nr: Number,
      nested: {
        obj: String
      }
    });
    var post = new Post({nr: "7", nested: {obj: "a"}});
    var obj = post.toJson();
    obj.nested.obj = "b";
    expect(post.nested).to.have.property('obj','a');
  });
});


describe('ModelsArray', function() {
  var Post;
  beforeEach(function() {
    Post = minimodel.Model.extend({
      nr: Number,
      nested: {
        obj: String
      }
    });
  });
  
  
  it('should export all models in the array', function() {
    var post1 = new Post({nr: "7", nested: {obj: "a"}});
    var post2 = new Post({nr: "8", nested: {obj: "b"}});
    var arr = new minimodel.ModelsArray();
    arr.push(post1, post2);
    
    expect(arr.toJson()).to.have.length(2);
    expect(arr.toJson()).to.have.deep.property('0.nr', 7);
    expect(arr.toJson()).to.have.deep.property('0.nested.obj', "a");
    expect(arr.toJson()).to.have.deep.property('1.nr', 8);
    
    expect(arr.toObject()).to.have.deep.property('0.nr', 7);
    expect(arr.toDb()).to.have.deep.property('1.nested.obj', "b");
  });
});


describe('Array Field', function() {
  describe('simple typed array elements', function() {
    var Post;
    beforeEach(function() {
      Post = minimodel.Model.extend({
        nr: Number,
        comments: [String]
      });
    });

    it('should set an array from constructor and retrieve from property', function() {
      var post = new Post({nr: "7", comments: ["aa", "aaa"]});

      expect(post.nr).to.be.equal(7);
      expect(post.comments[1]).to.be.equal("aaa");
    });

    it('should set an array from setter', function() {
      var post = new Post({nr: "7", comments: ["aa", "aaa"]});
      post.set('comments', ["bbb"]);

      expect(post.comments[0]).to.be.equal("bbb");
    });

    it('should replace an array element from setter', function() {
      var post = new Post({nr: "7", comments: ["aa", "aaa"]});
      post.set('comments.1', ["ccc"]);

      expect(post.comments).to.have.length(2);
      expect(post.comments[1]).to.be.equal("ccc");
    });

    it('should set a new array element from setter', function() {
      var post = new Post({nr: "7", comments: ["aa", "aaa"]});
      post.set('comments.2', ["ccc"]);

      expect(post.comments).to.have.length(3);
      expect(post.comments[2]).to.be.equal("ccc");
    });

    //skipped because not supported
    it.skip('should set an array element from property setter', function() {
      var post = new Post({nr: "7", comments: ["aa", "aaa"]});
      post.comments[1] = "ccc";

      expect(post.comments).to.have.length(2);
      expect(post.comments[1]).to.be.equal("ccc");
    });

    it('should assign entire array from property', function() {
      var post = new Post({nr: "7", comments: ["aa", "aaa"]});
      post.comments = ["ccc"];

      expect(post.get('comments')).to.have.length(1);
      expect(post.comments[0]).to.be.equal("ccc");
    });
  });


  describe('complex array elements', function() {
    var Post, post;
    beforeEach(function() {
      Post = minimodel.Model.extend({
        nr: Number,
        comments: {
          type: [
            {
              astring: String,
              anum: {
                type: Number,
                includeInJson: false
              }
            }
          ],
          includeInDb: false
        }
      });

      post = new Post({nr: "7", comments: [
        {
          astring: "aaa",
          anum: "8"
        }, {
          astring: "bbb",
          anum: "9"
        }
      ]});
    });

    it('should set an array from constructor and retrieve from property', function() {
      expect(post.nr).to.be.equal(7);
      expect(post.comments).to.have.length(2);
      expect(post.comments[1].astring).to.be.equal("bbb");
      expect(post.comments[1].anum).to.be.equal(9);
    });


    it('should set a property of an element from property accessor', function() {
      post.comments[1].astring = "ddd";
      expect(post.get('comments.1.astring')).to.be.equal("ddd");
    });


    it('should export values', function() {
      var exported = post.toObject();

      expect(exported.comments).to.have.length(2);
      expect(exported.comments[1].astring).to.be.equal("bbb");
      expect(exported.comments[1].anum).to.be.equal(9);
    });

    it('should not export excluded values', function() {
      var exported = post.toJson();

      expect(exported.comments).to.have.length(2);
      expect(exported.comments[1].astring).to.be.equal("bbb");
      expect(exported.comments[1].anum).to.be.undefined;
    });

    it('should not export the entire array', function() {
      var exported = post.toDb();

      expect(exported.comments).to.be.undefined;
    });
  });

  describe('validation', function() {
    it('should validate simple elements', function() {
      var Post = minimodel.Model.extend({
        arr: [Number]
      });
      
      var post = new Post({arr: ["1", "asd"]});
      expect(post.validate()).to.not.have.deep.property("errors.arr.errors.0");
      expect(post.validate()).to.have.deep.property("errors.arr.errors.1");
    });
  });
});


describe('Dynamic property definition', function() {
  it('should define a simple property after model definition', function() {
    var Model = minimodel.Model.extend({
      nr: Number
    });
    Model.property('aprop', String);
    
    var model = new Model({nr: "7", aprop: "tessst"});
    expect(model.nr).to.be.equal(7);
    expect(model.aprop).to.be.equal("tessst");
  });


  it('should define a complex property after model definition', function() {
    var Model = minimodel.Model.extend({
      nr: Number
    });
    Model.property('aprop', {
      p1: {
        type: String
      },
      p2: Number
    });

    var model = new Model({nr: "7", aprop: {p1: "tessst", p2: "3"}});
    expect(model.nr).to.be.equal(7);
    expect(model.aprop.p1).to.be.equal("tessst");
    expect(model.aprop.p2).to.be.equal(3);
  });

  it('should modify existing simple properties', function() {
    var Model = minimodel.Model.extend({
      nr: Number
    });
    Model.property('nr', String);

    var model = new Model({nr: "7"});
    expect(model.nr).to.be.equal("7");
  });

  it('should modify nested existing properties', function() {
    var Model = minimodel.Model.extend({
      p: {
        p1: {
          type: String
        },
        p2: String
      }
    });
    Model.property('p.p1', {
      type: Number,
      set: function(val) {
        this.setRaw(val + 1);
      }
    });

    var model = new Model({p: {p1: "7", p2: "3"}});
    expect(model.p.p1).to.be.equal(8);
    expect(model.p.p2).to.be.equal("3");
  });
});