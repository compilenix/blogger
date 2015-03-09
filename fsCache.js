var DirectoryCache = _Config.post.DirectoryCache || "cache";

function has(req) {
    return _fs.existsSync(_path(req));
}

function send(req, res) {
    if (has(req)) {
        var dataToSend = _fs.readFileSync(_path(req), 'utf8');
        res.writeHead(200, { "Content-Type": "text/html", "Content-Length": Buffer.byteLength(dataToSend, 'utf8'), "Server": "node.js/" + process.version});
        res.end(dataToSend);
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
