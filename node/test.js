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

function pi(it) { sys.puts(sys.inspect(it)) }

var Goal = CouchModel.newModel();

Goal.prototype.getFoo = function() { return 'foo'; }

CouchModel.db = db;

var goal = new Goal();

//pi(goal.getFoo)
//pi(goal.save)


/* Get a single doc */

var the_goal;

CouchModel.get(Goal, '41150457f3b521bb7fee1eb99a002977', function(err, it){
  the_goal = it;
  
  pi(the_goal);
  
  assert.ok('save' in the_goal, 'oh noes!');
});


return


/*** BOTTOM LINE: I want to be able to do this: **/

var Goal = new CouchModel();

Goal.prototype.getFoo = function() { return 'foo';}

var goal = new Goal();

goal.getFoo();