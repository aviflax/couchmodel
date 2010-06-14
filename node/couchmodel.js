var sys = require('sys');


if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}


function CouchModel(db) {
	if ( !(this instanceof arguments.callee) ) 
	  throw new Error("Constructor called as a function");
}


CouchModel.prototype.db = null;


CouchModel.prototype.getType = function() {
  return typeof(this);
}


CouchModel.newModel = function() {
  var model = function(){}
  model.prototype = CouchModel;
  //var instance =
  return new model();
}



CouchModel.prototype.checkDB = function() {
  if (this.db == null)
    throw new Error("db must be set before calling any methods!");
}


CouchModel.prototype.get = function(id, callback) {
  this.checkDB();
  
  var type = this;
  
  return this.constructor.name;
  
  this.db.getDoc(id, function(err, doc){
    if (err) {
      callback(err);
    } else {
      // need to wrap the doc as a new Thing — the sub-object of CouchModel.
      sys.puts(type.constructor.name)
      //sys.puts(sys.inspect(type.constructor, true, 5));
      //callback(null, new this(doc))
    }
  });
}

  
CouchModel.prototype.save = function(callback) {
  checkDB();
	this.db.saveDoc(this.doc, {success: callback});
}

	
CouchModel.prototype.del = function(callback) {
  checkDB();
	this.db.removeDoc(this.doc, {success: callback});
}


CouchModel.prototype.fromView = function(view, callback) {
  checkDB();
}


if (exports)
  exports.CouchModel = CouchModel;