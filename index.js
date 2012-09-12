var memcache = require('memcache'),
    request = require('request'),
    qs = require('querystring');

/*  
 *  This emitter lets us know when
 *  the node array is ready to be
 *  used.
 */
var readyEmitter = new (require('events')).EventEmitter();

/*  
 *  Getting an array of nodes which
 *  we use for views via HTTP.
 */
function getViewNodes(dbTarget, usr, pwd, obj) {
	request.get("http://" + usr + ':' + pwd + '@' + dbTarget + ":8091/pools/default", function (err, res, body) {
		nodes = JSON.parse(body).nodes;
		
		for (var i in nodes)
			nodes[i] = nodes[i].couchApiBase.replace("http://", "http://" + usr + ':' + pwd + '@');
		
		obj.nodes = nodes;

		/*  
		 *  We're ready to go!
		 */
		readyEmitter.emit('ready');
	});
}

var atto = function (memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd) {
	this.nodes = null;
	var client = new memcache.Client(memcachedPort, memcachedHost);
	client.connect();

	client.on('error', function (e) {
		console.log('Memcached protocol error');
	});

	this.set = function (key, value, cb) {
		if (typeof value == 'object')
			value = JSON.stringify(value);
		client.set(key, value, cb);
	};

	this.get = function (key, cb) {
		client.get(key, function (err, res) {
			if (!err) {
				try {
					var res = JSON.parse(res);
				} catch (e) {

				}
			}
			
			cb(err, res);
		});
	};

	this.view = function (designDoc, viewName, params, cb) {
		/*  
		 *  We're going to queue view
		 *  queries until we're ready.
		 */
		if(!nodes)
			readyEmitter.addListener('ready', function() {
				request.get(nodes[0] + bucketName + '/_design/' + designDoc + '/_view/' + viewName + '?' + qs.stringify(params), function (err, res, body) {
					cb(err, JSON.parse(body));
				});
			});
		else
			request.get(nodes[0] + bucketName + '/_design/' + designDoc + '/_view/' + viewName + '?' + qs.stringify(params), function (err, res, body) {
				cb(err, JSON.parse(body));
			});
	}
	
	/*  
	 *  Getting the array of nodes.
	 */
	getViewNodes(dbTarget, usr, pwd, this);
}

module.exports = function (memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd) {
	return new atto(memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd);
};
