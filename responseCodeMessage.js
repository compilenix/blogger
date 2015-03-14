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

		case 200:m="OK";break;
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

		// RFC for the 7XX Range of HTTP Status codes - Developer Errors
		// see: https://github.com/joho/7XX-rfc
		// version f916a3f6f5c8ed32b4cf2bcdad43ff0e89da00d3
		case 701:m="Meh";break;
		case 702:m="Emacs";break;
		case 703:m="Explosion";break;
		case 704:m="Goto Fail";break;
		case 705:m="I wrote the code and missed the necessary validation by an oversight";break;
		case 710:m="PHP";break;
		case 711:m="Convenience Store";break;
		case 712:m="NoSQL";break;
		case 719:m="I am not a teapot";break;
		case 720:m="Unpossible";break;
		case 721:m="Known Unknowns";break;
		case 722:m="Unknown Unknowns";break;
		case 723:m="Tricky";break;
		case 724:m="This line should be unreachable";break;
		case 725:m="It works on my machine";break;
		case 726:m="It's a feature, not a bug";break;
		case 727:m="32 bits is plenty";break;
		case 730:m="Fucking Bower";break;
		case 731:m="Fucking Rubygems";break;
		case 732:m="Fucking Unic💩de";break;
		case 733:m="Fucking Deadlocks";break;
		case 734:m="Fucking Deferreds";break;
		case 735:m="Fucking IE";break;
		case 736:m="Fucking Race Conditions";break;
		case 737:m="FuckThreadsing";break;
		case 738:m="Fucking Bundler";break;
		case 739:m="Fucking Windows";break;
		case 740:m="Computer says no";break;
		case 741:m="Compiling";break;
		case 742:m="A kitten dies";break;
		case 743:m="I thought I knew regular expressions";break;
		case 744:m="Y U NO write integration tests?";break;
		case 745:m="I don't always test my code, but when I do I do it in production";break;
		case 746:m="Missed Ballmer Peak";break;
		case 747:m="Motherfucking Snakes on the Motherfucking Plane";break;
		case 748:m="Confounded by Ponies";break;
		case 749:m="Reserved for Chuck Norris";break;
		case 750:m="Didn't bother to compile it";break;
		case 753:m="Syntax Error";break;
		case 754:m="Too many semi-colons";break;
		case 755:m="Not enough semi-colons";break;
		case 756:m="Insufficiently polite";break;
		case 757:m="Excessively polite";break;
		case 759:m="Unexpected T_PAAMAYIM_NEKUDOTAYIM";break;
		case 761:m="Hungover";break;
		case 762:m="Stoned";break;
		case 763:m="Under-Caffeinated";break;
		case 764:m="Over-Caffeinated";break;
		case 765:m="Railscamp";break;
		case 766:m="Sober";break;
		case 767:m="Drunk";break;
		case 768:m="Accidentally Took Sleeping Pills Instead Of Migraine Pills During Crunch Week";break;
		case 769:m="Questionable Maturity Level";break;
		case 771:m="Cached for too long";break;
		case 772:m="Not cached long enough";break;
		case 773:m="Not cached at all";break;
		case 774:m="Why was this cached?";break;
		case 776:m="Error on the Exception";break;
		case 777:m="Coincidence";break;
		case 778:m="Off By One Error";break;
		case 779:m="Off By Too Many To Count Error";break;
		case 780:m="Project owner not responding";break;
		case 781:m="Operations";break;
		case 782:m="QA";break;
		case 783:m="It was a customer request, honestly";break;
		case 784:m="Management, obviously";break;
		case 785:m="TPS Cover Sheet not attached";break;
		case 786:m="Try it now";break;
		case 787:m="Further Funding Required";break;
		case 788:m="Designer's final designs weren't";break;
		case 791:m="The Internet shut down due to copyright restrictions.";break;
		case 792:m="Climate change driven catastrophic weather event";break;
		case 793:m="Zombie Apocalypse";break;
		case 794:m="Someone let PG near a REPL";break;
		case 795:m="#heartbleed";break;
		case 797:m="This is the last page of the Internet. Go back";break;
		case 799:m="End of the world";break;

		default:m="Not Implemented";
	}
	return m;
}


exports.responseCodeMessage = responseCodeMessage;
exports.getDefaultMessage = getDefaultMessage;
exports.generateContent = generateContent;
