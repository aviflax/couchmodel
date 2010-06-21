if (typeof(require) === 'function') {

  var sys = require('sys'),
    assert = require('assert'),
    CouchModel = require('./couchmodel').CouchModel;
  
  var pi = function(it, showHidden) { sys.puts(sys.inspect(it, showHidden)) }

} else {
  
  var sys = {
    puts: function(it) {
      console.log(it);
    },
    inspect: function(it, showHidden) {
      return it;
    }
  }
  
  var assert = {
    ok: function(result, message) {
      if (!result) throw new Error(message);
    },
    equal: function(left, right, message) {
      if (left != right) throw new Error(message);
    }    
    
  }
  
}


function pi(it, showHidden) { sys.puts(sys.inspect(it, showHidden)) }


var db = {
  url: 'http://localhost:5984/avi/',
  username: 'avi',
  password: 'letmein'
}





/*** SETUP: Create the Goal Model and add functionality ***/

var Goal = CouchModel.newModel(db);

Goal.prototype.getFoo = function() { return 'foo'; }

var tests = [];















/*** Test 1: Get a single Goal, change it, save it ***/
tests.push(function(){
  Goal.get('41150457f3b521bb7fee1eb99a002977', function(err, goal){
    if (err)
      throw new Error(err);
    
    assert.ok(goal instanceof Goal, 'Model instance is not an instance of the Model.');
    assert.ok(goal instanceof CouchModel, 'Model instance is not an instance of CouchModel.');
    assert.ok('getFoo' in goal, 'Model instance does not contain "getFoo".');
    assert.equal(goal.getFoo(), 'foo', 'getFoo() is not returning "foo"!');
    assert.ok('save' in goal, 'Model instance does not contain "save".');
    
    goal.title += ', edited';
    
    var old_rev = goal._rev;
    
    goal.save(function(err){
      if (err)
        throw new Error(err);
      
      sys.puts('Goal successfully saved with new title: ' + goal.title + ' and new rev: ' + goal._rev);
        
      assert.ok(goal._rev !== old_rev, "The rev didn't change!");
      
      goal.title = goal.title.replace(', edited', '');
      
      goal.save(function(err{
        if (err)
          throw new Error(err);

        sys.puts('Goal successfully saved with new title: ' + goal.title + ' and new rev: ' + goal._rev);
      }));
    });
  });
});






/*** Test 2: Create a new goal, save it, then delete it ***/
tests.push(function(){
  
  var goal = new Goal();

  goal.title = 'Make some soup';
  
  goal.save(function(err){
        
    if (err)
      throw new Error(sys.inspect(err));
    
    sys.puts('New goal successfully saved with ID:' + goal._id + ' and rev: ' + goal._rev);
    
    var old_id = goal._id;
    var old_rev = goal._rev;
    
    goal.del(function(err){
      if (err)
        throw new Error(sys.inspect(err));

      // this should now return nothing
      Goal.get(old_id, function(err, goal){

        assert.ok(err, 'This should return an error but it isn\'t!');
        
        if (err)
          sys.puts('New goal successfully deleted: ' + sys.inspect(err));
      });
    });
    
  });
  
});






/*** Test 3: Get an array of Goals from a view **/
tests.push(function(){
  
  Goal.list('main', 'plate', function(err, goals){
    
    assert.ok(goals.length === 5, 'goals does not contain 5 goals.');
    assert.ok(goals[0] instanceof Goal, 'goals does not contain instances of Goal.');
    
    sys.puts('Successfully retreived 5 goals');
    
    function randomRangeInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    var rand_i = randomRangeInt(0, goals.length-1);
    var rand_goal = goals[rand_i];
    
    rand_goal.title += ', changed';

    rand_goal.save(function(err){
      if (err)
        throw new Error(sys.inspect(err));
        
      sys.puts('Successfully saved goal ' + rand_i + ' of array ' + ' with id ' + rand_goal._id + ' and rev ' + rand_goal._rev);
    });
    
  });
  
});


tests.forEach(function(test, i){
  sys.puts('Running Test ' + (i+1) + '...');
  test();
})