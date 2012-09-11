Atto
====
Atto is a minimalist Couchbase driver.

What does Atto do?
----
Atto lets you use Couchbase's memcached protocol to work with documents. Atto also supports HTTP views.

Atto automatically detects HTTP nodes. The implementation isn't very rich at this point, but it will get better in future releases.

What doesn't Atto do?
----
There is no way to create views from Atto.

Atto is not a "smart" memcached client. It won't automatically connect to multiple memcached servers. I suggest using Moxi, which ships with Couchbase.

API reference
====
Installation is simple. Just run `npm install atto`.

Creating the object
----
	// var db = require('atto')(memcachedPort, memcachedHost, dbHost, bucketName, bucketUsername, bucketPassword)
	
	var db = require('atto')(11211, '127.0.0.1', 'db.isomero.us', 'myBucket', 'bucketUser', 'bucketPassword')

Callbacks
----
Callbacks should be in the following format:
	function(error, response) {}

Set
----
	db.set(key, value, cb);

Get
----
	db.get(key, cb);

View
----
		db.view(designDoc, viewName, params, cb);
The first two parameters are strings. `params` should be an object like `{key: 'someKey'}`
