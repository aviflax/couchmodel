// First need a reference to the DB

//The minimum requirement for DB is: it must have a property "url"

//so:

var db = {url: "http://host/path/to/db"};

//optionally, you can add credentials:
// db.username = username;
// db.password = password;




// Create the Model

var Goal = CouchModel.newModel(db);



// ** Alternate syntax **
// If you're using explicit typing, 
// you can pass a second parameter in with the explicit type name
// var Goal = CouchModel.newModel(db, 'goal');





// Add functionality to the Model

Goal.prototype.__defineSetter__('title', function(){
	// Check for tags
	
	// Set tags
});


Goal.prototype.__defineGetter__('titleNoTags', function(){
	// strip the tags from the title
});



// you can add getters or setters or plain old methods

Goal.prototype.foo = function() {
	return 'foo';
}

// you can even override prototype methods
Goal.prototype.save = function(callback) {
  this.last_modified = new Date().toISOString();

  // call the super-object prototype's save()
  CouchModel.prototype.save.call(this, callback);
}


// you can also add a special function named "init"
// and it will be called during construction

Goal.prototype.init = function() {
  this.created = new Date().toISOString();
}




// Create a new Goal

var goal = new Goal();
goal.title = 'Personal: eat lunch';
goal.save(function(err){
  if (err)
    throw new Error(err);

  sys.puts('It worked!');
});




// Get a single Goal
Goal.get('24325235235234', function(err, goal){
  if (err)
    throw new Error(err);

  sys.puts('It worked!');
  
  // Do something with goal
});
	


// Get a list (array) of Goals (from a view)

Goal.list('main', 'plate', function (err, goals){
  // do something with the goals
  goals.forEach(function(goal){
    sys.puts(goal.title);
  })
});




// Delete a Goal

the_goal.del(function(err){
	if (err)
		alert('delete failed: ' + err);
	else
		alert('delete succeeded!');
});



// Access an aspect of a Goal

alert(goal.title);



// Change an aspect of a Goal

goal.complete = true;



// Save a Goal

the_goal.save(function(err){
	if (err)
		alert('save failed: ' + err);
	else
		alert('save succeeded! id is:' + this._id);
})






/** OPTIONAL: CouchDB helper object
 *   This object is just a convenience object for retrieving arbitrary views.
 *   It doesn't really fit the mission of CouchModel, but it's useful, because
 *   it leverages CouchModel's cross-platform infrastructure
*/

var db = new CouchModel.CouchDB("http://host/path/to/db");

var design_doc = 'main';
var view_name = 'stuff';
var options = {limit: 21};

db.view(design_doc, view_name, options, function(err, data){
  if (err)
    throw new Error(err);
    
  // do something with the data
  alert('Got ' + data.rows.length + " results!");
  
  data.rows.forEach(function(row){
    
    alert("key: " + row.key + "\nvalue: " + row.value);
    
  });
})