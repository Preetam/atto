var memcache = require('memcache'),
		request  = require('request'),
		qs       = require('querystring');


function getViewNodes(dbTarget, usr, pwd, obj) {
	request.get("http://"+usr+':'+pwd+'@'+dbTarget+":8091/pools/default", function(err, res, body) {
		nodes = JSON.parse(body).nodes;
		for(var i in nodes)
		nodes[i] = nodes[i].couchApiBase.replace("http://", "http://"+usr+':'+pwd+'@');
		obj.nodes = nodes;
	});
}

var atto = function(memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd) {
	var client = new memcache.Client(memcachedPort, memcachedHost);
	client.connect();
	client.on('error', function(e) {
		console.log('Memcached protocol error');
	});

	this.set = function(key, value, cb) {
		if(typeof value == 'object')
			value = JSON.stringify(value);

		client.set(key, value, cb);
	};

	this.get = function(key, cb) {
		client.get(key, function(err, res) {
			if(!err) {
				try {
					var obj = JSON.parse(res);
					cb(err, obj);
				}
				catch(e) {
					cb(err, res);
				}
			}
			else
			cb(err, res);
		});
	};

	this.view = function(designDoc, viewName, params, cb) {
		request.get(this.nodes[0]+bucketName+'/_design/'+designDoc+'/_view/'+viewName+'?'+qs.stringify(params), function(err, res, body) {
			cb(err, JSON.parse(body));
		});
	}

	getViewNodes(dbTarget, usr, pwd, this);
}

module.exports = function(memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd) {
	return new atto(memcachedPort, memcachedHost, dbTarget, bucketName, usr, pwd);
};
