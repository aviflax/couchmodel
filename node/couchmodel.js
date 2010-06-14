var sys = require('sys');

function pi(it, showHidden) { sys.puts(sys.inspect(it, showHidden)) }

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

  this.db = null;
}


CouchModel.prototype.readyState = 'READY';


CouchModel.prototype.getType = function() {
  return typeof(this);
}


CouchModel.newModel = function(db) {
  
  function Model(db, doc) {
    if (db)
      this.db = db;
    
    if (doc)
      for (var p in doc)
        this[p] = doc[p];
  }
  
  Model.prototype = new CouchModel();
  
  Model.prototype.constructor = Model; // from http://www.coolpage.com/developer/javascript/Correct%20OOP%20for%20Javascript.html
  
  // Add getter functions to Model
  for (var p in CouchModel)
    Model[p] = CouchModel[p];
  
  if (db)
    Model.db = db;
  
  return Model;
}



CouchModel.checkDB = function() {
  if (this.db == null)
    throw new Error("db must be set before calling any methods!");
}


CouchModel.get = function(id, callback) {
  this.checkDB();

  // Need a reference to this so it can be called in subsequent closures
  var Model = this;
  
  this.db.getDoc(id, function(err, doc){
    if (err) {
      callback(err);
    } else {
      callback(null, new Model(this.db, doc));
    }
  });
}


CouchModel.fromView = function(model, view, callback) {
  checkDB();

  // Need a reference to this so it can be called in subsequent closures
  var Model = this;
}




/*** INSTANCE METHODS ***/
  
CouchModel.prototype.save = function(callback) {
  checkDB();
	this.db.saveDoc(this.doc, {success: callback});
}

	
CouchModel.prototype.del = function(callback) {
  checkDB();
	this.db.removeDoc(this.doc, {success: callback});
}


if (exports)
  exports.CouchModel = CouchModel;