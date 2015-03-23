var DirectoryCache = _Config.DirectoryCache  || "cache";

function has(req) {
	return _fs.existsSync(_path(req));
}

function send(req, res) {
	if (has(req)) {
		var data = JSON.parse(_fs.readFileSync(_path(req), 'utf8'));
		res.setResponseCode(data.response_code);
		res.setContentType(data.mime_type);
		res.setLastModified(new Date(_fs.statSync(_path(req)).mtime).toUTCString());
		res.setContent(data.content);
		res.send();
	}
}

function getLastModified(req) {
	if (has(req)) {
		return new Date(_fs.statSync(_path(req)).mtime).toUTCString();
	} else {
		return false;
	}
}

function validate(req) {
	if (has(req) && (cachedDate = (_fs.statSync(_path(req)).mtime).getTime())) {
		var data = JSON.parse(_fs.readFileSync(_path(req), 'utf8'));

		for (var i = data.dependencies.length - 1; i >= 0; i--) {
			try {
				if ((_fs.statSync(data.dependencies[i]).mtime).getTime() > cachedDate) {
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

function del(req) {
	if (has(req)) {
		var file = _path(req);
		console.log("Remove cache file: " + file);
		_fs.unlinkSync(file);
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

function add(req, content, mime, code, dependsOn) {
	_init();
	var data = JSON.stringify({
		mime_type: mime,
		response_code: code,
		dependencies: dependsOn,
		content: content
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
exports.clear = clear;
exports.has = has;
exports.validate = validate;
exports.del = del;
