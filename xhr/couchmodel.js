var sys = require('sys');


function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  }).toUpperCase();
}


function CouchModel(db) {
	if ( !(this instanceof arguments.callee) ) 
	  throw new Error("Constructor called as a function.");
}


CouchModel.newModel = function(db) {
  
  if (!db || !(db.client))
    throw new Error("newModel(db) requires a valid db.");
  
  function Model(doc) {
    if (doc)
      for (var p in doc)
        this[p] = doc[p];
  }
  
  Model.prototype = new CouchModel();

  // Not sure whether I need this or not.
  // Model.prototype.constructor = Model; // from http://www.coolpage.com/developer/javascript/Correct%20OOP%20for%20Javascript.html
  
  // The DB goes on the prototype because it needs to be accessed by get() and fromView(),
  // which are methods of the Constructor object, and by the instance methods.
  Model.prototype.db = db;
  
  Model.get = function(id, callback) {
    var Model = this;

    this.prototype.db.getDoc(id, function(err, doc){
      if (err) {
        callback(err);
      } else {
        callback(null, new Model(doc));
      }
    });
  }

  Model.fromView = function(design, view, callback) {
    var Model = this;  

    this.prototype.db.view(design, view, {include_docs:true}, function(err, response){

      var result = [];

      if (response.rows.forEach) {
        response.rows.forEach(function(row){
          result.push(new Model(row.doc));
        });
      }

      callback(err, result);

    });
  }
  
  return Model;
}


CouchModel.prototype.readyState = 'READY';


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


exports.CouchModel = CouchModel;