
function memCache() {
	this.cache = {};
}

memCache.prototype.has = function(req) {
	return typeof this.cache[this._hash(req)] != 'undefined';
}

memCache.prototype.send = function(req, res) {
	if (this.has(req)) {
		var data = this.cache[this._hash(req)].content;
		res.setResponseCode(this.cache[this._hash(req)].response_code);
		res.setContentType(this.cache[this._hash(req)].mime_type);
		res.setLastModified(this.getLastModified(req));
		res.setContent(data);
		res.send();
	}
}

memCache.prototype.getLastModified = function(req) {
	if (this.has(req)) {
		return (this.cache[this._hash(req)].time).toUTCString();
	} else {
		return false;
	}
}

memCache.prototype.validate = function (req) {
	var cached = this.cache[this._hash(req)] || false;
	if (this.has(req) && (cachedDate = (cached.time).getTime())) {

		for (var i = cached.dependencies.length - 1; i >= 0; i--) {
			try {
				if ((_fs.statSync(cached.dependencies[i]).mtime).getTime() > cachedDate) {
					return false;
				}
			} catch (e) {
				return false;
			}
		};
		return true;
	} else {
		return false;
	}
}

memCache.prototype.del = function (req) {
	if (this.has(req)) {
		console.log("Remove cache file: " + this._hash(req));
		this.cache[this._hash(req)] = undefined;
	}
}

memCache.prototype.clear = function() {
	this.cache = {};
}

memCache.prototype.add = function(req, cont, mime, code, dependsOn) {

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

memCache.prototype._hash = function(req) {
	var shasum = _crypto.createHash('sha1');
	shasum.update(req.url);
	return shasum.digest('hex');
}

exports.memCache = memCache;
