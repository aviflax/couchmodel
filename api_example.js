// Create the Model

var Goal = CouchModel.newModel(db);



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
var the_goals;

Goal.list('main', 'plate', function (err, them){
  the_goals = them;
});




// Delete a Goal

the_goal.del(function(err){
	if (err)
		alert('delete failed: ' + err);
	else
		alert('delete succeeded!');
});



// Access an aspect of a Goal

alert(the_goal.title);



// Change an aspect of a Goal

the_goal.complete = true;



// Save a Goal

the_goal.save(function(err){
	if (err)
		alert('save failed: ' + err);
	else
		alert('save succeeded! id is:' + this._id);
})