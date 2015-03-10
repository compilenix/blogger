function _responseWrapper(response) {
    this.response = response;
    this.data = '';
    this.responseCode = 404;
    this.contentLength = 0;
    this.contentType = _Config.DefaultContentType || "text/html";
    this.serverVersion = _Config.ServerVersion || "node.js/" + process.version;
}

_responseWrapper.prototype.setContent = function (content) {
    this.data = content;
    this.updateLength();
}

_responseWrapper.prototype.getContent = function (content) {
    return this.data;
}


_responseWrapper.prototype.setContentType = function (type) {
    this.contentType = type;
}

_responseWrapper.prototype.setResponseCode = function (code) {
    this.responseCode = code;
}

_responseWrapper.prototype.updateLength = function () {
    this.contentLength = Buffer.byteLength(this.data, 'utf8');
}

_responseWrapper.prototype.send = function () {
    this.response.writeHead(this.responseCode, { "Content-Type": this.contentType, "Content-Length": this.contentLength, "Server": this.serverVersion});
    this.response.end(this.data);
}

exports.responseWrapper = _responseWrapper;
