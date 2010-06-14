var sys = require('sys'),
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


var Goal = Object.create(CouchModel.prototype);

Goal.getFoo = function() { return 'foo'; }

Goal.db = db;

var goal = Object.create(Goal);

//sys.puts(sys.inspect(Goal.prototype, true))

//sys.puts(new Goal().getFoo())

sys.puts(goal.getFoo());
sys.puts(goal.get())

return


/* Get a single doc */

var the_goal;

Goal.get('41150457f3b521bb7fee1eb99a002977', function(err, doc){
  the_goal = doc;
  
  sys.puts(sys.inspect(the_goal));
});