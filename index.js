var memcached = require('memcached')
, request = require('request')
, qs = require('querystring');

/*  
 *  Getting an array of nodes which
 *  we use for views via HTTP.
 */
function getViewNodes(dbTarget, usr, pwd, obj, readyEmitter) {

	if(usr && pwd)
		request.get("http://" + usr + ':' + pwd + '@' + dbTarget + ":8091/pools/default", function (err, res, body) {

			nodes = JSON.parse(body).nodes;
			
			for (var i in nodes) {
				nodes[i] = nodes[i].couchApiBase.replace("http://", "http://" + usr + ':' + pwd + '@');
			}

			obj.nodes = nodes;

			/*  
			 *  We're ready to go!
			 */
			readyEmitter.emit('ready');
		});
	else
		request.get("http://" + dbTarget + ":8091/pools/default", function (err, res, body) {
			nodes = JSON.parse(body).nodes;

			obj.nodes = nodes;

			/*  
			 *  We're ready to go!
			 */
			readyEmitter.emit('ready');
		});
}

var atto = function (memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd) {
	/*  
	 *  This emitter lets us know when
	 *  the node array is ready to be
	 *  used.
	 */
	this.readyEmitter = new (require('events')).EventEmitter();

	this.nodes = null;
	memcached = new memcached(memcachedHost+':'+memcachedPort);

	this.set = function (key, value, cb, lifetime) {
		if(!lifetime) lifetime = 0;
		memcached.set(key, value, lifetime, cb);
	};

	this.get = function (key, cb) {
		memcached.get(key, cb);
	};

	this.incr = function (key, value, cb) {
		memcached.increment(key, value, cb);
	};

	this.decr = function (key, value, cb) {
		memcached.decrement(key, value, cb);
	};

	this.view = function (designDoc, viewName, params, cb) {

		for(var key in params)
			params[key] = JSON.stringify(params[key]);

		/*  
		 *  We're going to queue view
		 *  queries until we're ready.
		 */
		if(typeof this.nodes == 'undefined' || this.nodes == null) {
			this.readyEmitter.addListener('ready', function() {
				request.get(nodes[0] + bucketName + '/_design/' + designDoc + '/_view/' + viewName + '?' + qs.stringify(params), function (err, res, body) {
					cb(err, JSON.parse(body));
				});
			});
		}
		else {
			request.get(this.nodes[0] + bucketName + '/_design/' + designDoc + '/_view/' + viewName + '?' + qs.stringify(params), function (err, res, body) {
				cb(err, JSON.parse(body));
			});
		}
	};

	/*  
	 *  Getting the array of nodes.
	 */
	getViewNodes(dbTarget, usr, pwd, this, this.readyEmitter);

	this.close = function() {
		client.close();
	};
}

module.exports = function (memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd) {
	return new atto(memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd);
};
