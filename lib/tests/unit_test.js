"use strict";

global.querystring = require("querystring");
global.url = require("url");
global.fs = require("fs");
global.crypto = require("crypto");
global.os = require("os");

function GetFsDelimiter() {
    switch (os.platform()) {
        case "darvin":
        case "freebsd":
        case "linux":
        case "sunos":
        default:
            return "/";
        case "win32":
            return "\\";
    }
}

var ConfigFile = undefined;
if (fs.existsSync(".." + GetFsDelimiter() + ".." + GetFsDelimiter() + "Config.js")) {
    ConfigFile = ".." + GetFsDelimiter() + ".." + GetFsDelimiter() + "Config.js";
} else {
    ConfigFile = ".." + GetFsDelimiter() + ".." + GetFsDelimiter() + "Config.js.example";
}

global.Config = require(ConfigFile).Config;
global.Helper = require(".." + GetFsDelimiter() + "Helper.js");
require(".." + GetFsDelimiter() + "cache" + GetFsDelimiter() + "NullCache.js");

const WARNING = 0;
const NOTICE = 1;
const DEBUG = 2;
const GOOD = 3;

var anyTestFailed = false;

function log(msg, log_level) {
    switch (log_level) {
        case WARNING:
            process.stdout.write("\x1b[33mWarning: " + msg + "\x1b[0m\n");
            break;
        case NOTICE:
            process.stdout.write("\x1b[36mNotice:  " + msg + "\x1b[0m\n");
            break;
        case DEBUG:
            process.stdout.write("\x1b[33mDebug:   " + msg + "\x1b[0m\n");
            break;
        case GOOD:
            process.stdout.write("\x1b[32m" + msg + "\x1b[0m\n");
            break;
    }
}

function test_true(val, descr) {
    if (val === true) {
        log("PASSED: " + descr, GOOD);
        return true;
    } else {
        log("FAILED: " + descr, WARNING);
        anyTestFailed = true;
        return false;
    }
}

function test_false(val, descr) {
    if (val === false) {
        log("PASSED: " + descr, GOOD);
        return true;
    } else {
        log("FAILED: " + descr, WARNING);
        anyTestFailed = true;
        return false;
    }
}

function test_equal(val1, val2, descr) {
    if (val1 === val2) {
        log("PASSED: " + descr, GOOD);
        return true;
    } else {
        log("FAILED: " + descr + " => \"" + val1 + "\" != \"" + val2 + "\"", WARNING);
        anyTestFailed = true;
        return false;
    }
}


var tests = [];

tests.push({
    test: function() {
        log("testing ResponseWrapper", NOTICE);

        var pass = true;
        const responseWrapper = require(".." + GetFsDelimiter() + "ResponseWrapper.js").ResponseWrapper;
        global.Cache = true;
        const r = new responseWrapper();
        const dummy_request = { url: "test/?x=y" };
        const dummy_content = "<test> foo bar baz </test>";
        const dummy_mimetype = "dummy/mime";
        r.setContent(dummy_content);
        pass &= test_equal(r.getContent(), dummy_content, "content as expected after setting");
        pass &= test_equal(r.contentLength, 26, "content length as expected after setting");

        r.setResponseCode(200);
        pass &= test_equal(r.getResponseCode(), 200, "response code as expected after setting");

        r.setContentType(dummy_mimetype);
        pass &= test_equal(r.getContentType(), dummy_mimetype, "content type as expected after setting");

        return pass;
    }
});

tests.push({
    test: function() {
        log("testing FsCache", NOTICE);

        var pass = true;

        require(".." + GetFsDelimiter() + "cache" + GetFsDelimiter() + "FsCache.js");
        const c = new FsCache();
        c.clear();
        const dummy_request = { url: "test/?x=y" };
        const dummy_content = "<test> foo bar baz </test>";
        const dummy_mimetype = "dummy/mime";
        c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
        pass &= test_true(c.has(dummy_request), "cache file present after adding");
        c.clear();
        pass &= test_false(c.has(dummy_request), "cache file not present after cache reap");
        c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
        pass &= test_true(c.has(dummy_request), "cache file present after re adding");
        c.del(dummy_request);
        pass &= test_false(c.has(dummy_request), "cache file not present after delete");
        const responseWrapper = require(".." + GetFsDelimiter() + "ResponseWrapper.js").ResponseWrapper;
        global.Cache = true;
        const dummy_response = new responseWrapper();
        dummy_response.send = function() {};

        c.add(dummy_request, dummy_content, dummy_mimetype, 200);


        c.send(dummy_request, dummy_response);

        pass &= test_equal(dummy_response.data, dummy_content, "content as expected");
        pass &= test_equal(dummy_response.contentType, dummy_mimetype, "mimetype as expected");
        pass &= test_equal(dummy_response.responseCode, 200, "status code as expected");

        c.clear();

        return pass;
    }
});

tests.push({
    test: function() {
        log("testing MemCache", NOTICE);

        var pass = true;

        require(".." + GetFsDelimiter() + "cache" + GetFsDelimiter() + "MemCache.js");
        const c = new MemCache();
        c.clear();
        const dummy_request = { url: "test/?x=y" };
        const dummy_content = "<test> foo bar baz </test>";
        const dummy_mimetype = "dummy/mime";
        c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
        pass &= test_true(c.has(dummy_request), "mem cache entry present after adding");
        c.clear();
        pass &= test_false(c.has(dummy_request), "mem cache entry not present after cache reap");
        c.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype);
        pass &= test_true(c.has(dummy_request), "mem cache entry present after re adding");
        c.del(dummy_request);
        pass &= test_false(c.has(dummy_request), "mem cache entry not present after delete");
        const responseWrapper = require(".." + GetFsDelimiter() + "ResponseWrapper.js").ResponseWrapper;
        global.Cache = true;
        const dummy_response = new responseWrapper();
        dummy_response.send = function() {};

        c.add(dummy_request, dummy_content, dummy_mimetype, 200);


        c.send(dummy_request, dummy_response);

        pass &= test_equal(dummy_response.data, dummy_content, "content as expected");
        pass &= test_equal(dummy_response.contentType, dummy_mimetype, "mimetype as expected");
        pass &= test_equal(dummy_response.responseCode, 200, "status code as expected");

        c.clear();

        return pass;
    }
});

tests.push({
    test: function() {
        log("testing helper functions");

        var pass = true;
        
        var helper = require(".." + GetFsDelimiter() + "helper.js");

        var data = helper.getPosts(false);
        pass &= test_true(Array.isArray(data), "getPosts (reverse) - return type is an array");
        pass &= test_equal(data.length, 2, "getPosts (reverse) - return array length is 2");
        pass &= test_equal(data[0], "56cb9c69", "getPosts (reverse) - return [0] equals \"56cb9c69\"");
        pass &= test_equal(data[1], "56cb9c4a", "getPosts (reverse) - return [1] equals \"56cb9c4a\"");
        pass &= test_equal(helper.getTitle(data[0]), "aa (new)", "getTitle (reverse) - equals \"aa (new)\"");
        pass &= test_equal(helper.getTitle(data[1]), "aa (old)", "getTitle (reverse) - equals \"aa (old)\"");

        data = helper.getPosts(true);
        pass &= test_true(Array.isArray(data), "getPosts - return type is an array");
        pass &= test_equal(data.length, 2, "getPosts - return array length is 2");
        pass &= test_equal(data[0], "56cb9c4a", "getPosts - return [0] equals \"56cb9c4a\"");
        pass &= test_equal(data[1], "56cb9c69", "getPosts - return [1] equals \"56cb9c69\"");
        pass &= test_equal(helper.getTitle(data[0]), "aa (old)", "getTitle - equals \"aa (old)\"");
        pass &= test_equal(helper.getTitle(data[1]), "aa (new)", "getTitle - equals \"aa (new)\"");

        data = helper.getTitles(false);
        pass &= test_true(Array.isArray(data), "getTitles (reverse) - return type is an array");
        pass &= test_equal(data.length, 2, "getTitles (reverse) - return array length is 2");
        pass &= test_equal(data[0], "aa (new)", "getTitles (reverse) - return [0] equals \"aa (new)\"");
        pass &= test_equal(data[1], "aa (old)", "getTitles (reverse) - return [1] equals \"aa (old)\"");

        data = helper.getTitles(true);
        pass &= test_true(Array.isArray(data), "getTitles - return type is an array");
        pass &= test_equal(data.length, 2, "getTitles - return array length is 2");
        pass &= test_equal(data[0], "aa (old)", "getTitles - return [0] equals \"aa (old)\"");
        pass &= test_equal(data[1], "aa (new)", "getTitles - return [1] equals \"aa (new)\"");

        helper.writePost("testpost", "testcontent", "testtitle");
        data = helper.getPost("testpost");
        pass &= test_equal(data.title, "testtitle", "writePost / getPost - return title");
        pass &= test_equal(data.contents, "testcontent", "writePost / getPost - return contents");
        helper.removePost("testpost");
        pass &= test_false(helper.postExists("testpost"), "removePost - remove \"testpost\"");

        return pass;
    }
});

// TODO more tests!

for (var i = 0; i < tests.length; i++) {
    tests[i].test();
};

if (anyTestFailed) {
    log("A test has failed!", WARNING);
}
