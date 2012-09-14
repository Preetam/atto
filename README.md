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
Installation is simple.

	$ npm install atto

Creating the object
----
	var db = require('atto')(memcachedPort, memcachedHost, dbHost, bucketName, bucketUsername, bucketPassword)

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

*Response:* An object if the value is valid JSON. Otherwise, the response is a string.

Increment
----
	db.inc(key[, value], cb);

*Response:* The incremented value.

Decrement
----
	db.dec(key[, value], cb);

*Response:* The decremented value.

View
----
	db.view(designDoc, viewName, params, cb);

The first two parameters are strings. `params` should be an object (for `querystring`):

	{
		key: 'documentKey',
		limit: 10
	}

*Response:* Unmodified JSON from the HTTP request.

TODO
----
* Optional bucket authentication (required right now)
* Optional key expiration
* More memcached functions
