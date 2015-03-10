var DirectoryCache = _Config.DirectoryCache  || "cache";

function has(req) {
	return _fs.existsSync(_path(req));
}

function send(req, res) {
	if (has(req)) {
		var dataToSend = _fs.readFileSync(_path(req), 'utf8');
		res.setContent(dataToSend);
		return res;
	}
}

function add(req, cont) {
	_fs.writeFileSync(_path(req), cont);
}

function _hash(req) {
	var shasum = _crypto.createHash('sha1');
	shasum.update(req.url);
	return shasum.digest('hex');
}

function _path(req) {
	return DirectoryCache + '/' + _hash(req);
}

exports.send = send;
exports.add = add;
exports.has = has;
