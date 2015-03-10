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

function clear() {
	var cacheFileList = _fs.readdirSync(DirectoryCache);

	for (var i = 0; i < cacheFileList.length; i++) {
		console.log("Remove cache file: " + DirectoryCache + "/" + cacheFileList[i]);
		_fs.unlinkSync(DirectoryCache + "/" + cacheFileList[i]);
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
exports.clear = clear;
exports.has = has;
