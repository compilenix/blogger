class ResponseCodeMessage {
	/**
	 * Creates an instance of ResponseCodeMessage.
	 * @param {ResponseWrapper} response
	 * @memberOf ResponseCodeMessage
	 */
	constructor(response) {
		this.message = "";
		this.response = response;
		this.code = 404;
	}

	/**
	 * @public
	 * @param {boolean} overwriteContent
	 * @returns {ResponseWrapper}
	 * @memberOf ResponseCodeMessage
	 */
	prepareAndGetResponse(overwriteContent) {
		if (this.message === null || this.message === undefined || this.message === "") {
			this.code = this.response.getResponseCode();
			this.message = this.getMessageFromCode(this.code);
			this.response.setResponseStatusMessage(this.message);
		}

		if (!overwriteContent) {
			this.response.setContent(this.generateContent());
		}

		return this.response;
	}

	/**
	 * @public
	 * @param {string} text
	 * @memberOf ResponseCodeMessage
	 */
	setAlternativeStatusCodeMessage(text) {
		this.message = text;
	}

	/**
	 * @public
	 * Generates the html content
	 * @memberOf ResponseCodeMessage
	 */
	generateContent() {
		return `
		<html>
			<head>
				<title>${this.code} ${this.message}</title>
				<meta charset="UTF-8">
			</head>
			<body bgcolor="white">
				<center><h1>${this.code} ${this.message}</h1></center>
				<hr>
			</body>
		</html>`;
	}

	/**
	 * @public
	 * Returns default http status code message
	 * @param {number} code
	 * @returns {string} default http status code message
	 * @memberOf ResponseCodeMessage
	 */
	getMessageFromCode(code) { // jshint -W074
		switch (code) {
			case 100: return "Continue";
			case 101: return "Switching Protocols";
			case 102: return "Processing";

			case 200: return "OK";
			case 201: return "Created";
			case 202: return "Accepted";
			case 203: return "Non-Authoritative Information";
			case 204: return "No Content";
			case 205: return "Reset Content";
			case 206: return "Partial Content";
			case 207: return "Multi-Status";
			case 208: return "Already Reported";
			case 226: return "IM Used";

			case 300: return "Multiple Choices";
			case 301: return "Moved Permanently";
			case 302: return "Found";
			case 303: return "See Other";
			case 304: return "Not Modified";
			case 305: return "Use Proxy";
			case 306: return "Switch Proxy";
			case 307: return "Temporary Redirect";
			case 308: return "Permanent Redirect";

			case 400: return "Bad Request";
			case 401: return "Unauthorized";
			case 402: return "Payment Required";
			case 403: return "Forbidden";
			case 404: return "Not Found";
			case 405: return "Method Not Allowed";
			case 406: return "Not Acceptable";
			case 407: return "Proxy Authentication Required";
			case 408: return "Request Timeout";
			case 409: return "Conflict";
			case 410: return "Gone";
			case 411: return "Length Required";
			case 412: return "Precondition Failed";
			case 413: return "Request Entity Too Large";
			case 414: return "Request-URI Too Long";
			case 415: return "Unsupported Media Type";
			case 416: return "Requested Range Not Satisfiable";
			case 417: return "Expectation Failed";
			case 418: return "I'm a teapot";
			case 419: return "Authentication Timeout";
			case 420: return "Method Failure";
			case 422: return "Unprocessable Entity";
			case 423: return "Locked";
			case 424: return "Failed Dependency";
			case 426: return "Upgrade Required";
			case 428: return "Precondition Required";
			case 429: return "Too Many Requests";
			case 431: return "Request Header Fields Too Large";
			case 440: return "Login Timeout";
			case 444: return "No Response";
			case 449: return "Retry With";
			case 450: return "Blocked by Windows Parental Controls";
			case 451: return "Unavailable For Legal Reasons";
			case 494: return "Request Header Too Large";
			case 495: return "Cert Error";
			case 496: return "No Cert";
			case 497: return "HTTP to HTTPS";
			case 498: return "Token expired/invalid";
			case 499: return "Client Closed Request";

			case 500: return "Internal Server Error";
			case 501: return "Not Implemented";
			case 502: return "Bad Gateway";
			case 503: return "Service Unavailable";
			case 504: return "Gateway Timeout";
			case 505: return "HTTP Version Not Supported";
			case 506: return "Variant Also Negotiates";
			case 507: return "Insufficient Storage";
			case 508: return "Loop Detected";
			case 509: return "Bandwidth Limit Exceeded";
			case 510: return "Not Extended";
			case 511: return "Network Authentication Required";
			case 598: return "Network read timeout error";
			case 599: return "Network connect timeout error";

			// RFC for the 7XX Range of HTTP Status codes - Developer Errors
			// see: https://github.com/joho/7XX-rfc
			// version 22cc8e16d6569850b9494aaf2a725022319ba0ca from 2016-06-11T04:50:24Z
			case 701: return "Meh";
			case 702: return "Emacs";
			case 703: return "Explosion";
			case 704: return "Goto Fail";
			case 705: return "I wrote the code and missed the necessary validation by an oversight";
			case 706: return "Delete Your Account";
			case 710: return "PHP";

			case 711: return "Convenience Store";
			case 712: return "NoSQL";
			case 718: return "Haskell";
			case 719: return "I am not a teapot";
			case 720: return "Unpossible";

			case 721: return "Known Unknowns";
			case 722: return "Unknown Unknowns";
			case 723: return "Tricky";
			case 724: return "This line should be unreachable";
			case 725: return "It works on my machine";
			case 726: return "It's a feature, not a bug";
			case 727: return "32 bits is plenty";

			case 730: return "Fucking Bower";
			case 731: return "Fucking Rubygems";
			case 732: return "Fucking Unic💩de";
			case 733: return "Fucking Deadlocks";
			case 734: return "Fucking Deferreds";
			case 735: return "Fucking IE";
			case 736: return "Fucking Race Conditions";
			case 737: return "FuckThreadsing";
			case 738: return "Fucking Bundler";
			case 739: return "Fucking Windows";

			case 740: return "Computer says no";
			case 741: return "Compiling";
			case 742: return "A kitten dies";
			case 743: return "I thought I knew regular expressions";
			case 744: return "Y U NO write integration tests?";
			case 745: return "I don't always test my code, but when I do I do it in production";
			case 746: return "Missed Ballmer Peak";
			case 747: return "Motherfucking Snakes on the Motherfucking Plane";
			case 748: return "Confounded by Ponies";
			case 749: return "Reserved for Chuck Norris";

			case 750: return "Didn't bother to compile it";
			case 753: return "Syntax Error";
			case 754: return "Too many semi-colons";
			case 755: return "Not enough semi-colons";
			case 756: return "Insufficiently polite";
			case 757: return "Excessively polite";
			case 759: return "Unexpected T_PAAMAYIM_NEKUDOTAYIM";

			case 761: return "Hungover";
			case 762: return "Stoned";
			case 763: return "Under-Caffeinated";
			case 764: return "Over-Caffeinated";
			case 765: return "Railscamp";
			case 766: return "Sober";
			case 767: return "Drunk";
			case 768: return "Accidentally Took Sleeping Pills Instead Of Migraine Pills During Crunch Week";
			case 769: return "Questionable Maturity Level";

			case 771: return "Cached for too long";
			case 772: return "Not cached long enough";
			case 773: return "Not cached at all";
			case 774: return "Why was this cached?";
			case 775: return "Out of cash";
			case 776: return "Error on the Exception";
			case 777: return "Coincidence";
			case 778: return "Off By One Error";
			case 779: return "Off By Too Many To Count Error";

			case 780: return "Project owner not responding";
			case 781: return "Operations";
			case 782: return "QA";
			case 783: return "It was a customer request, honestly";
			case 784: return "Management, obviously";
			case 785: return "TPS Cover Sheet not attached";
			case 786: return "Try it now";
			case 787: return "Further Funding Required";
			case 788: return "Designer's final designs weren't";
			case 789: return "Not my department";

			case 791: return "The Internet shut down due to copyright restrictions";
			case 792: return "Climate change driven catastrophic weather event";
			case 793: return "Zombie Apocalypse";
			case 794: return "Someone let PG near a REPL";
			case 795: return "#heartbleed";
			case 797: return "This is the last page of the Internet. Go back";
			case 799: return "End of the world";

			default: return "Internal Server Error";
		}
	}
}

module.exports = ResponseCodeMessage;
