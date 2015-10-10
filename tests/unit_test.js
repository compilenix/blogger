"use strict"

global._querystring = require('querystring');
global._url = require('url');
global._fs = require('fs');
global._crypto = require('crypto');

var _ConfigFile = undefined;
if (_fs.existsSync("../Config.js")) {
	_ConfigFile = "../Config.js";
} else {
	_ConfigFile = "../Config.js.example";
}

global._Config = require(_ConfigFile).Config;
global._helper = require('../helper.js');

const WARNING = 0;
const NOTICE = 1;
const DEBUG = 2;

var verbose = 2;

function log(msg, log_level) {
	if (log_level <= verbose) {
		switch (log_level) {
			case WARNING:
				console.log('Warning: ' + msg);
				break;
			case NOTICE:
				console.log('Notice:  ' + msg);
				break;
			case DEBUG:
				console.log('Debug:   ' + msg);
				break;
		}
	}
}

function test_true(val, descr) {
	if (val === true) {
		log(descr + ' : PASSED', NOTICE);
		return true;
	} else {
		log(descr + ' : FAILED', WARNING);
		return false;
	}
}

function test_false(val, descr) {
	if (val === false) {
		log(descr + ' : PASSED', NOTICE);
		return true;
	} else {
		log(descr + ' : FAILED', WARNING);
		return false;
	}
}

function test_equal(val1, val2, descr) {
	if (val1 === val2) {
		log(descr + ' : PASSED', NOTICE);
		return true;
	} else {
		log(descr + ' : FAILED', WARNING);
		return false;
	}
}


var tests = [];

tests.push({
	test: function() {
		log('testing responseWrapper', NOTICE);

		var pass = true;

		var responseWrapper = require('../responseWrapper.js').responseWrapper;

		global._cache = true;
		var r = new responseWrapper();

		var dummy_request = {url: 'test/?x=y'};
		var dummy_content = '<test> foo bar baz </test>';
		var dummy_mimetype = 'dummy/mime';

		r.setContent(dummy_content);
		pass &= test_equal(r.getContent(), dummy_content, 'content as expected after setting');
		pass &= test_equal(r.contentLength, 26, 'content length as expected after setting');

		r.setResponseCode(200);
		pass &= test_equal(r.getResponseCode(), 200, 'response code as expected after setting');

		r.setContentType(dummy_mimetype);
		pass &= test_equal(r.getContentType(), dummy_mimetype, 'content type as expected after setting');
	
		return pass;
	}
})

tests.push({
	test: function() {
		log('testing fsCache', NOTICE);

		var pass = true;

		var fsCache = require('../fsCache.js').fsCache;
		var c = new fsCache();

		c.clear();

		var dummy_request = {url: 'test/?x=y'};
		var dummy_content = '<test> foo bar baz </test>';
		var dummy_mimetype = 'dummy/mime';


		c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
		pass &= test_true(c.has(dummy_request), 'cache file present after adding');
		c.clear();
		pass &= test_false(c.has(dummy_request), 'cache file not present after cache reap');
		c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
		pass &= test_true(c.has(dummy_request), 'cache file present after re adding');
		c.del(dummy_request);
		pass &= test_false(c.has(dummy_request), 'cache file not present after delete');

		var responseWrapper = require('../responseWrapper.js').responseWrapper;

		global._cache = true;
		var dummy_response = new responseWrapper();
		dummy_response.send = function() {};

		c.add(dummy_request, dummy_content, dummy_mimetype, 200);


		c.send(dummy_request, dummy_response);

		pass &= test_equal(dummy_response.data, dummy_content, 'content as expected');
		pass &= test_equal(dummy_response.contentType, dummy_mimetype, 'mimetype as expected');
		pass &= test_equal(dummy_response.responseCode, 200, 'status code as expected');

		c.clear;

		return pass;
	}
})

tests.push({
	test: function() {
		log('testing memCache', NOTICE);

		var pass = true;

		var memCache = require('../memCache.js').memCache;
		var c = new memCache();

		c.clear();

		var dummy_request = {url: 'test/?x=y'};
		var dummy_content = '<test> foo bar baz </test>';
		var dummy_mimetype = 'dummy/mime';


		c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
		pass &= test_true(c.has(dummy_request), 'mem cache entry present after adding');
		c.clear();
		pass &= test_false(c.has(dummy_request), 'mem cache entry not present after cache reap');
		c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
		pass &= test_true(c.has(dummy_request), 'mem cache entry present after re adding');
		c.del(dummy_request);
		pass &= test_false(c.has(dummy_request), 'mem cache entry not present after delete');

		var responseWrapper = require('../responseWrapper.js').responseWrapper;

		global._cache = true;
		var dummy_response = new responseWrapper();
		dummy_response.send = function() {};

		c.add(dummy_request, dummy_content, dummy_mimetype, 200);


		c.send(dummy_request, dummy_response);

		pass &= test_equal(dummy_response.data, dummy_content, 'content as expected');
		pass &= test_equal(dummy_response.contentType, dummy_mimetype, 'mimetype as expected');
		pass &= test_equal(dummy_response.responseCode, 200, 'status code as expected');

		c.clear;

		return pass;
	}
})

for (var i = 0; i < tests.length; i++) {
	if (!tests[i].test()) {
		log('a test has failed!', WARNING)
		break;
	}
};
