var sys = require('sys');

function pi(it, showHidden) { sys.puts(sys.inspect(it, showHidden)) }


function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  }).toUpperCase();
}



function CouchModel(db) {
	if ( !(this instanceof arguments.callee) ) 
	  throw new Error("Constructor called as a function");
}


CouchModel.prototype.db = null;

CouchModel.prototype.readyState = 'READY';

CouchModel.newModel = function(db) {
  
  if (!db)
    throw new Error("newModel(db) requires db!");
  
  function Model(doc) {
    if (doc)
      for (var p in doc)
        this[p] = doc[p];
  }
  
  Model.prototype = new CouchModel();
  
  Model.prototype.constructor = Model; // from http://www.coolpage.com/developer/javascript/Correct%20OOP%20for%20Javascript.html
  
  Model.prototype.db = db;
  
  // Add getter functions to Model
  for (var p in CouchModel)
    Model[p] = CouchModel[p];
  
  // Add reference to DB
  // This goes on the Constructor and not the prototype because the constructor
  // has methods which need it, such as get()
  // Although I suppose those could just call this.prototype.db, maybe
  Model.db = db;
  
  return Model;
}



CouchModel.checkDB = function() {
  if (this.db == null)
    throw new Error("db must be set before calling any methods!");
}


CouchModel.get = function(id, callback) {
  var Model = this;
  
  this.db.getDoc(id, function(err, doc){
    if (err) {
      callback(err);
    } else {
      callback(null, new Model(doc));
    }
  });
}


CouchModel.fromView = function(design, view, callback) {
  var Model = this;  

  this.db.view(design, view, {include_docs:true}, function(err, response){
    
    var result = [];
    
    if (response.rows.forEach) {
      response.rows.forEach(function(row){
        result.push(new Model(row.doc));
      });
    }
    
    callback(err, result);
    
  });
}




/*** INSTANCE METHODS ***/
  
CouchModel.prototype.save = function(callback) {
	if (!this._id)
	  this._id = UUID();
	
	var instance = this;
	
	this.db.saveDoc(this._id, this, function(err, response){
	  if (response.rev)
      instance._rev = response.rev;
    
    callback(err);
	});
}

	
CouchModel.prototype.del = function(callback) {
	this.db.removeDoc(this._id, this._rev, callback);
}


/*** EXPORTS ***/
exports.CouchModel = CouchModel;