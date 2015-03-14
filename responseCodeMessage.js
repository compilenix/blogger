function responseCodeMessage(response, diffrentMessage) {
	var code = response.getResponseCode();
	var content = response.getContent();
	var message = getDefaultMessage(code);

	if (content === '') {
		content = generateContent(code, message);
	}
	if (content === '' && diffrentMessage) {
		content = generateContent(code, diffrentMessage);
	}

	response.setContent(content);
	response.send();
}

function generateContent(code, message) {
	return '<html><head><title>' + code + ' ' + message + '</title><meta charset="UTF-8"></head><body bgcolor="white"><center><h1>' + code + ' ' + message + '</h1></center><hr><center>' + _Config.ServerVersion || "node.js/" + process.version + '</center></body></html>\n';
}

function getDefaultMessage(code) {
	var m='';

	switch(code) {
		case 100:m="Continue";break;
		case 101:m="Switching Protocols";break;
		case 102:m="Processing";break;

		case 200:m="OK 💩";break;
		case 201:m="Created";break;
		case 202:m="Accepted";break;
		case 203:m="Non-Authoritative Information";break;
		case 204:m="No Content";break;
		case 205:m="Reset Content";break;
		case 206:m="Partial Content";break;
		case 207:m="Multi-Status";break;
		case 208:m="Already Reported";break;
		case 226:m="IM Used";break;

		case 300:m="Multiple Choices";break;
		case 301:m="Moved Permanently";break;
		case 302:m="Found";break;
		case 303:m="See Other";break;
		case 304:m="Not Modified";break;
		case 305:m="Use Proxy";break;
		case 306:m="Switch Proxy";break;
		case 307:m="Temporary Redirect";break;
		case 308:m="Permanent Redirect";break;

		case 400:m="Bad Request";break;
		case 401:m="Unauthorized";break;
		case 402:m="Payment Required";break;
		case 403:m="Forbidden";break;
		case 404:m="Not Found";break;
		case 405:m="Method Not Allowed";break;
		case 406:m="Not Acceptable";break;
		case 407:m="Proxy Authentication Required";break;
		case 408:m="Request Timeout";break;
		case 409:m="Conflict";break;
		case 410:m="Gone";break;
		case 411:m="Length Required";break;
		case 412:m="Precondition Failed";break;
		case 413:m="Request Entity Too Large";break;
		case 414:m="Request-URI Too Long";break;
		case 415:m="Unsupported Media Type";break;
		case 416:m="Requested Range Not Satisfiable";break;
		case 417:m="Expectation Failed";break;
		case 418:m="I'm a teapot";break;
		case 419:m="Authentication Timeout";break;
		case 420:m="Method Failure";break;
		case 422:m="Unprocessable Entity";break;
		case 423:m="Locked";break;
		case 424:m="Failed Dependency";break;
		case 426:m="Upgrade Required";break;
		case 428:m="Precondition Required";break;
		case 429:m="Too Many Requests";break;
		case 431:m="Request Header Fields Too Large";break;
		case 440:m="Login Timeout";break;
		case 444:m="No Response";break;
		case 449:m="Retry With";break;
		case 450:m="Blocked by Windows Parental Controls";break;
		case 451:m="Unavailable For Legal Reasons";break;
		case 494:m="Request Header Too Large";break;
		case 495:m="Cert Error";break;
		case 496:m="No Cert";break;
		case 497:m="HTTP to HTTPS";break;
		case 498:m="Token expired/invalid";break;
		case 499:m="Client Closed Request";break;

		case 500:m="Internal Server Error";break;
		case 501:m="Not Implemented";break;
		case 502:m="Bad Gateway";break;
		case 503:m="Service Unavailable";break;
		case 504:m="Gateway Timeout";break;
		case 505:m="HTTP Version Not Supported";break;
		case 506:m="Variant Also Negotiates";break;
		case 507:m="Insufficient Storage";break;
		case 508:m="Loop Detected";break;
		case 509:m="Bandwidth Limit Exceeded";break;
		case 510:m="Not Extended";break;
		case 511:m="Network Authentication Required";break;
		case 598:m="Network read timeout error";break;
		case 599:m="Network connect timeout error";break;

		default:m="Not Implemented";
	}
	return m;
}


exports.responseCodeMessage = responseCodeMessage;
exports.getDefaultMessage = getDefaultMessage;
exports.generateContent = generateContent;
