var crypto = require("crypto");

class NullCache {
	NullCache() {

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
		return crypto.createHash("sha1").update(req.url).digest("hex");
	}
}

global.NullCache = NullCache;
