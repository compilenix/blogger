var DirectoryCache = _Config.DirectoryCache  || "cache";

function has(req) {
	return _fs.existsSync(_path(req));
}

function send(req, res) {
	if (has(req)) {
		var data = JSON.parse(_fs.readFileSync(_path(req), 'utf8'));
		res.setResponseCode(data.response_code);
		res.setContentType(data.mime_type);
		res.setContent(data.content);
		return res;
	}
}

function clear() {
	_init();
	var cacheFileList = _fs.readdirSync(DirectoryCache);

	for (var i = 0; i < cacheFileList.length; i++) {
		console.log("Remove cache file: " + DirectoryCache + "/" + cacheFileList[i]);
		_fs.unlinkSync(DirectoryCache + "/" + cacheFileList[i]);
	}
}

function add(req, cont, mime, code) {
	_init();
	var data = JSON.stringify({
		content: cont,
		mime_type: mime,
		response_code:code
	});
	_fs.writeFileSync(_path(req), data);
}

function _hash(req) {
	var shasum = _crypto.createHash('sha1');
	shasum.update(req.url);
	return shasum.digest('hex');
}

function _path(req) {
	return DirectoryCache + '/' + _hash(req) + ".json";
}

function _init() {
	if (! _fs.existsSync(DirectoryCache)) {
		_fs.mkdirSync(DirectoryCache);
	}
}

exports.send = send;
exports.add = add;
exports.clear = clear;
exports.has = has;
