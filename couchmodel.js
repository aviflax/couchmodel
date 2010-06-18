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

    xhr.open(method, url);

    xhr.setRequestHeader('Accept', 'application/json');

    if (data)
      xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(data);

  }

} else if (typeof(require) === 'function') {
  
  var http = require('http');
  var urllib = require('url');

  httprequest = function(method, url, data, callback) {
    
    var parsed_url = urllib.parse(url);
    
    var client = http.createClient(parsed_url.port, parsed_url.hostname);
    
    var req_headers = [];
    
    req_headers.push(['Accept', 'application/json']);

    if (data !== null) {
      
      if (typeof(data) === 'object')
        data = JSON.stringify(data);
      
      req_headers.push(['Content-Type', 'application/json']);
      req_headers.push(['Content-Length', data.length]);
    }
    
    var request = client.request(method.toUpperCase(), url, req_headers);
    
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


CouchModel.newModel = function(db) {
  
  if (!db || !(db.url))
    throw new Error("newModel(db) requires a valid db.");
    
  if (db.url.charAt(db.url.length-1) !== '/') {
    db.url += '/';
  }
  
  function Model(doc) {
    if (doc)
      for (var p in doc)
        this[p] = doc[p];
  }
  
  Model.prototype = new CouchModel();

  // Not sure whether I need this or not.
  // Model.prototype.constructor = Model; // from http://www.coolpage.com/developer/javascript/Correct%20OOP%20for%20Javascript.html
  
  // The DB goes on the prototype because it needs to be accessed by get() and fromView(),
  // which are methods of the Constructor object, and also by the instance methods.
  Model.prototype.db = db;
  
  Model.get = function(id, callback) {
    var Model = this;

    httprequest('GET', db.url + id, null, function(err, representation) {
      if (err)
        callback(err);
      else
        callback(null, new Model(representation));
    });
  }

  Model.fromView = function(design, view, callback) {
    var Model = this;

    var url = db.url + '_design/' + design + '/_view/' + view + '?include_docs=true';

    httprequest('GET', url, null, function(err, response){
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
	
	httprequest('PUT', this.db.url + this._id, JSON.stringify(this), function(err, representation) {
	  if (err)
      callback(err);

	  if (representation.rev) {
      instance._rev = representation.rev;
      callback(null);
    } else {
      callback('Response representation does not include "rev". It is a ' + typeof(representation) + ': ' + representation);
    }
	});
}


CouchModel.prototype.del = function(callback) {
  var url = this.db.url + this._id + '?rev=' + this._rev;
  
	httprequest('DELETE', url, null, callback);
}


if (typeof(exports) === 'object')
  exports.CouchModel = CouchModel;