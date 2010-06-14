var sys = require('sys'),
  assert = require('assert'),
  CouchModel = require('./couchmodel').CouchModel,
  couchdb = require('./lib/node-couchdb/lib/couchdb'),
  client = couchdb.createClient(5984, 'localhost', 'avi', 'inarockss'),
  db = client.db('avi');


if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}

function pi(it, showHidden) { sys.puts(sys.inspect(it, showHidden)) }

var Goal = CouchModel.newModel(db);

assert.ok('get' in Goal, 'Model does not contain get');

Goal.prototype.getFoo = function() { return 'foo'; }

//Goal.db = db;

//var goal = new Goal();
//pi(goal.getFoo)
//pi(goal.save)


/* Get a single doc */

var the_goal;

Goal.get('41150457f3b521bb7fee1eb99a002977', function(err, it){
  the_goal = it;
  
  pi(the_goal);
  
  assert.ok('getFoo' in the_goal, 'Model instance does not contain "getFoo".');
  assert.ok('save' in the_goal, 'Model instance does not contain "save".');
  assert.ok(the_goal instanceof Goal, 'Model instance is not an instance of the Model.');
  assert.ok(the_goal instanceof CouchModel, 'Model instance is not an instance of CouchModel.');
  assert.ok('db' in the_goal, 'Model instance does not contain "db".');
  pi(the_goal.db);
});


return


/*** BOTTOM LINE: I want to be able to do this: **/

var Goal = new CouchModel();

Goal.prototype.getFoo = function() { return 'foo';}

var goal = new Goal();

goal.getFoo();