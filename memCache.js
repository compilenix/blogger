
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
		return _rfc822Date(this.cache[this._hash(req)].time);
	} else {
		return false;
	}
}

memCache.prototype.clear = function() {
	this.cache = {};
}

memCache.prototype.add = function(req, cont, mime, code) {

	var data = {
		content: cont,
		mime_type: mime,
		response_code: code,
		time: new Date()
	}
	console.log("Add mem cache" + this._hash(req));
	this.cache[this._hash(req)] = data;
}

memCache.prototype._hash = function(req) {
	var shasum = _crypto.createHash('sha1');
	shasum.update(req.url);
	return shasum.digest('hex');
}

exports.memCache = memCache;
