var nullCache = require('./nullCache.js').nullCache;

class memCache extends nullCache {
	constructor() {
		super();
		this.cache = {};
	}

	has(req) {
		return typeof this.cache[this._hash(req)] != 'undefined';
	}

	send(req, res) {
		if (this.has(req)) {
			var data = this.cache[this._hash(req)].content;
			res.setResponseCode(this.cache[this._hash(req)].response_code);
			res.setContentType(this.cache[this._hash(req)].mime_type);
			res.setLastModified(this.getLastModified(req));
			res.setContent(data);
			res.send();
		}
	}

	getLastModified(req) {
		if (this.has(req)) {
			return (this.cache[this._hash(req)].time).toUTCString();
		} else {
			return false;
		}
	}

	del(req) {
		if (this.has(req)) {
			console.log("Remove cache file: " + this._hash(req));
			this.cache[this._hash(req)] = undefined;
		}
	}

	clear() {
		this.cache = {};
	}

	add(req, cont, mime, code, dependsOn) {
		var data = {
			mime_type: mime,
			response_code: code,
			time: new Date(),
			dependencies: dependsOn,
			content: cont
		}
		console.log("Add mem cache " + this._hash(req));
		this.cache[this._hash(req)] = data;
	}

	_hash(req) {
		return super._hash(req);
	}

}


exports.memCache = memCache;
