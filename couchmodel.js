"use strict";

function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  }).toUpperCase();
}

var httprequest;

if (typeof(XMLHttpRequest) !== 'undefined') {

  httprequest = function(method, url, data, callback) {

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(event) {
      if (this.readyState !== 4) {
        return;
      }

      if (this.status >= 200 && this.status < 300 || this.status === 1223) {

        var contenttype = this.getResponseHeader('Content-Type');

        if (contenttype === 'application/json' || contenttype === 'text/json')
          callback(null, JSON.parse(this.responseText));
        else
          callback(null, this.responseText);

      } else {
        callback(this.status + ' ' + this.statusText + '\n' + this.responseText);
      }
    }

    xhr.open(method, url, true, this.username, this.password);

    xhr.setRequestHeader('Accept', 'application/json');

    if (data) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      if (typeof(data) === 'object')
        data = JSON.stringify(data);
    }

    xhr.send(data);

  }

} else if (typeof(require) === 'function') {
  
  var http = require('http'),
      urllib = require('url'),
      base64 = require('./base64');

  httprequest = function(method, url, data, callback) {
    var url = urllib.parse(url);
    var client = http.createClient(url.port, url.hostname);
    
    var req_headers = [];
    
    req_headers.push(['Accept', 'application/json']);
    req_headers.push(['Host', url.hostname]);

    if (this && 'username' in this && 'password' in this) {
      req_headers.push(['Authorization', 'Basic ' + base64.encode(this.username + ":" + this.password)]);
    }

    if (data !== null) {
      
      if (typeof(data) === 'object')
        data = JSON.stringify(data);
      
      req_headers.push(['Content-Type', 'application/json']);
      req_headers.push(['Content-Length', data.length]);
    }
    
    var req_path = url.pathname + (url.search || '');
    var request = client.request(method.toUpperCase(), req_path, req_headers);
    
    var response_body = '';
    
    request.addListener('response', function(response) {
      response.setEncoding('utf8');
      
      response.addListener('data', function(chunk) {
        response_body += chunk;
      });
      
      response.addListener('end', function() {
        if (response.statusCode >= 200 && response.statusCode < 300) {

          var content_type = response.headers['content-type'];

          if (content_type === 'application/json' || content_type === 'text/json')
            callback(null, JSON.parse(response_body));
          else
            callback(null, response_body);

        } else {
          callback(response.statusCode + ': ' + response_body);
        }
      })
    });
    
    if (data !== null) {
      request.write(data, 'utf8');
    }
    
    request.end();
  }
  
} else {
  throw new Error('No XHR and no require? What the?');
}


function CouchModel(db) {
	if ( !(this instanceof arguments.callee) ) 
	  throw new Error("Constructor called as a function.");
}


CouchModel.newModel = function(db, type) {
  
  if (!db || !(db.url))
    throw new Error("newModel(db) requires a valid db.");
    
  if (db.url.charAt(db.url.length-1) !== '/') {
    db.url += '/';
  }
  
  function Model(doc) {
    if (doc)
      for (var p in doc)
        this[p] = doc[p];
        
    if (typeof(type) === 'string' && type.length)
      this.type = type;
      
    this.init();
  }
  
  Model.prototype = new CouchModel();
  
  Model.prototype.init = function(){};
  
  // The DB goes on the prototype because in addition to being used by get() and list(),
  // which are methods of the Constructor object, it's also used by the instance methods.
  Model.prototype.db = db;

  // Model.get() and Model.list() can access db via closure
  
  Model.get = function(id, callback) {
    var Model = this;

    httprequest.call(db, 'GET', db.url + id, null, function(err, representation) {
      if (err)
        callback(err);
      else
        callback(null, new Model(representation));
    });
  }

  Model.list = function(design, view, options, callback) {
    var Model = this;

    var url = db.url + '_design/' + design + '/_view/' + view + '?include_docs=true';

    for (var name in options) {
      var value = options[name];

      if (name == "key" || name == "startkey" || name == "endkey")
        value = JSON.stringify(value);

      url += '&' + encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }

    httprequest.call(db, 'GET', url, null, function(err, response){
      var ModelList = function(){};
      ModelList.prototype = new Array();
      
      ModelList.prototype.lastKey = null;
      ModelList.prototype.lastID = null;
      
      var result = new ModelList();

      if (typeof(response.rows) === 'object' && response.rows instanceof Array) {
        response.rows.forEach(function(row){
          result.push(new Model(row.doc));
        });
        
        result.lastKey = response.rows.length ? response.rows[response.rows.length-1].key : null;
        result.lastID = response.rows.length ? response.rows[response.rows.length-1].id : null;
      }

      callback(err, result);
    });
  }
  
  return Model;
}


CouchModel.CouchDB = function(url) {
  if ( !(this instanceof arguments.callee) ) 
	  throw new Error("Constructor called as a function.");

  if (typeof(url) !== 'string' || !(url.contains('http')))
    throw new Error('db() requires a URL.');

  // "this" refers to the new instance of CouchDB
  this.url = url;
}


CouchModel.CouchDB.prototype.view = function(design, name, options, callback) {
  var url = this.url + '_design/' + design + '/_view/' + name;
  
  if (options) {
    var params = []
    
    for (var name in options) {
      params.push(encodeURIComponent(name) + "=" + encodeURIComponent(options[name]));
    }
    
    url += '?' + params.join('&');
  }
  
  httprequest('GET', url, null, callback);
}



// Not sure if I need/want this, it's just an idea
//CouchModel.prototype.readyState = 'READY';


CouchModel.prototype.save = function(callback) {
	if (!this._id)
	  this._id = UUID();
	
	var instance = this;
	
	httprequest.call(this.db, 'PUT', this.db.url + this._id, this, function(err, representation) {
	  if (err && callback)
      callback(err);

	  if (representation.rev && callback) {
      instance._rev = representation.rev;
      callback(null);
    } else if (callback) {
      callback('Response representation does not include "rev". It is a ' + typeof(representation) + ': ' + representation);
    }
	});
	
	// In many libraries I like to have methods return this, to support chaining
	// But here that'd be a mistake, because people might forget that saving is async, and if they want something to
	// happen after the saving completes, it has to be in the callback
}


CouchModel.prototype.del = function(callback) {
  var url = this.db.url + this._id + '?rev=' + this._rev;
  
	httprequest.call(this.db, 'DELETE', url, null, callback);
}


CouchModel.prototype.set = function(name, value) {
  this[name] = value;
  return this;
}

if (typeof(exports) === 'object')
  exports.CouchModel = CouchModel;