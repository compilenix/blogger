var DirectoryCache = _Config.DirectoryCache  || "cache";

function has(req) {
	return _fs.existsSync(_path(req));
}

function send(req, res) {
	if (has(req)) {
		var data = JSON.parse(_fs.readFileSync(_path(req), 'utf8'));
		res.setResponseCode(data.response_code);
		res.setContentType(data.mime_type);
		res.setLastModified(_rfc822Date(new Date(_fs.statSync(_path(req)).mtime)));
		res.setETag(getETag(req));
		res.setContent(data.content);
		res.send();
	}
}

function getLastModified(req) {
	if (has(req)) {
		return _rfc822Date(new Date(_fs.statSync(_path(req)).mtime));
	} else {
		return false;
	}
}

function getETag(req) {
	return _hash(req);
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
	console.log("Add cache file: " + _path(req));
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
exports.getLastModified = getLastModified;
exports.getETag = getETag;
exports.clear = clear;
exports.has = has;
