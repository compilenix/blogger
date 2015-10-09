class nullCache {
	constructor() {

	}

	has(req) {
		return false;
	}

	send(req, res) {
		res.send();
	}

	getLastModified(req) {
		return 0;
	}

	validate(req) {
		return false;
	}

	del(req) {
		return null;
	}

	clear() {
		return null;
	}

	add(req, cont, mime, code, dependsOn) {
		return null;
	}

	_hash(req) {
		var shasum = _crypto.createHash('sha1');
		shasum.update(req.url);
		return shasum.digest('hex');
	}
}

exports.nullCache = nullCache;
