var nullCache = require('./nullCache.js').nullCache;

class fsCache extends nullCache {
	constructor() {
		super();

		this.DirectoryCache = _Config.DirectoryCache  || "cache";
		if (! _fs.existsSync(this.DirectoryCache)) {
			_fs.mkdirSync(this.DirectoryCache);
		}
	}

	has(req) {
		return _fs.existsSync(this._path(req));
	}

	send(req, res) {
		if (this.has(req)) {
			var data = JSON.parse(_fs.readFileSync(this._path(req), 'utf8'));
			res.setResponseCode(data.response_code);
			res.setContentType(data.mime_type);
			res.setLastModified(new Date(_fs.statSync(this._path(req)).mtime).toUTCString());
			res.setContent(data.content);
			res.send();
		}
	}

	getLastModified(req) {
		if (this.has(req)) {
			return new Date(_fs.statSync(this._path(req)).mtime).toUTCString();
		} else {
			return false;
		}
	}

	del(req) {
		if (this.has(req)) {
			var file = this._path(req);
			console.log("Remove cache file: " + file);
			_fs.unlinkSync(file);
		}
	}

	clear() {
		var cacheFileList = _fs.readdirSync(this.DirectoryCache);
		for (var i = 0; i < cacheFileList.length; i++) {
			console.log("Remove cache file: " + this.DirectoryCache + "/" + cacheFileList[i]);
			_fs.unlinkSync(this.DirectoryCache + "/" + cacheFileList[i]);
		}
	}

	add(req, cont, mime, code) {
		var data = JSON.stringify({
			mime_type: mime,
			response_code: code,
			content: cont
		});
		console.log("Add cache file: " + this._path(req));
		_fs.writeFileSync(this._path(req), data);
	}

	_hash(req) {
		var shasum = _crypto.createHash('sha1');
		shasum.update(req.url);
		return shasum.digest('hex');
	}

	_path(req) {
		return this.DirectoryCache + '/' + this._hash(req) + ".json";
	}
}

exports.fsCache = fsCache;
