'use-strict'
const os = require('os')
const zlib = require('zlib')
const fs = require('fs-extra')

if (!fs.existsSync('./Config.js')) {
  fs.copySync('./Config.example.js', './Config.js')
}

const ResponseWrapper = require('../ResponseWrapper.js')
const FsCache = require('../Cache/FsCache.js')
const MemCache = require('../Cache/MemCache.js')
const Find = require('../RequestHandlers/Find.js')

const config = require('../../Config.js')

function GetFsDelimiter () {
  switch (os.platform()) {
    default:
      return '/'
    case 'win32':
      return '\\'
  }
}

config.post.DirectoryPosts = `lib${GetFsDelimiter()}tests${GetFsDelimiter()}posts`
const Helper = require('../Helper.js')

const WARNING = 0
const NOTICE = 1
const DEBUG = 2
const GOOD = 3

let anyTestFailed = false

/**
 * @param {string} msg
 * @param {Number} log_level
 */
function log (msg, log_level) {
  switch (log_level) {
    case WARNING:
      process.stdout.write('\x1b[33mWarning: ' + msg + '\x1b[0m\n')
      break
    case NOTICE:
      process.stdout.write('\x1b[36mNotice: ' + msg + '\x1b[0m\n')
      break
    case DEBUG:
      process.stdout.write('\x1b[33mDebug: ' + msg + '\x1b[0m\n')
      break
    case GOOD:
      process.stdout.write('\x1b[32m' + msg + '\x1b[0m\n')
      break
  }
}

/**
 * @param {boolean} val
 * @param {string} descr
 */
function test_true (val, descr) {
  if (val === true) {
    log('PASSED: ' + descr, GOOD)
    return true
  } else {
    log('FAILED: ' + descr, WARNING)
    anyTestFailed = true
    throw new Error(`Test for true failed; result was false. (${descr})`)
    // return false;
  }
}

/**
 * @param {boolean} val
 * @param {string} descr
 */
function test_false (val, descr) {
  if (val === false) {
    log('PASSED: ' + descr, GOOD)
    return true
  } else {
    log('FAILED: ' + descr, WARNING)
    anyTestFailed = true
    throw new Error(`Test for false failed; result was true. (${descr})`)
    // return false;
  }
}

/**
 * @param {any} val1
 * @param {any} val2
 * @param {string} descr
 */
function test_equal (val1, val2, descr) {
  if (val1 === val2) {
    log('PASSED: ' + descr, GOOD)
    return true
  } else {
    log(`FAILED: ${descr} => "${val1}" != "${val2}"`, WARNING)
    anyTestFailed = true
    throw new Error(`Test for eqal value failed (${descr}):\n${JSON.stringify(val1)}\nis not eqal to\n${JSON.stringify(val2)}`)
    // return false;
  }
}

const tests = []

// TODO Add test for NullCache

tests.push({
  test: () => {
    log('testing ResponseWrapper', NOTICE)

    let pass = true
    const response = new ResponseWrapper(null) // TODO mock http response object
    const dummy_content = '<test> foo bar baz </test>'
    const dummy_mimetype = 'dummy/mime'
    response.setContent(dummy_content)
    response.updateLength()
    pass = pass && test_equal(response.getContent(), dummy_content, 'content as expected after setting')
    pass = pass && test_equal(response.contentLength, 26, 'content length as expected after setting')

    response.setResponseCode(200)
    pass = pass && test_equal(response.getResponseCode(), 200, 'response code as expected after setting')

    response.setContentType(dummy_mimetype)
    pass = pass && test_equal(response.getContentType(), dummy_mimetype, 'content type as expected after setting')

    return pass
  }
})

tests.push({
  test: () => {
    log('testing FsCache', NOTICE)

    let pass = true

    const cache = new FsCache()
    cache.clear()
    let dummy_request = { url: 'test/?x=y', headers: { 'accept-encoding': '' } }
    const dummy_content = '<test> foo bar baz </test>'
    const dummy_mimetype = 'dummy/mime'

    cache.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype)
    pass = pass && test_true(cache.has(dummy_request), 'cache file present after adding')
    cache.clear()
    pass = pass && test_false(cache.has(dummy_request), 'cache file not present after cache clear')
    cache.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype)
    pass = pass && test_true(cache.has(dummy_request), 'cache file present after re adding')
    cache.del(dummy_request)
    pass = pass && test_false(cache.has(dummy_request), 'cache file not present after delete')
    const dummy_response = new ResponseWrapper()
    dummy_response.send = () => {}

    cache.add(dummy_request, dummy_content, dummy_mimetype, 200)
    cache.send(dummy_request, dummy_response)

    pass = pass && test_equal(dummy_response.data, dummy_content, 'content as expected')
    pass = pass && test_equal(dummy_response.contentType, dummy_mimetype, 'mimetype as expected')
    pass = pass && test_equal(dummy_response.responseCode, 200, 'status code as expected')

    dummy_request = { url: 'test/?x=y', headers: { 'accept-encoding': 'gzip,deflate' } }
    cache.add(dummy_request, dummy_content, dummy_mimetype, 200)
    cache.send(dummy_request, dummy_response)
    pass = pass && test_equal(zlib.gunzipSync(Buffer.from(dummy_response.data)).toString(), dummy_content, 'content_gzip as expected')

    dummy_request = { url: 'test/?x=y', headers: { 'accept-encoding': 'deflate,gzip' } }
    cache.add(dummy_request, dummy_content, dummy_mimetype, 200)
    cache.send(dummy_request, dummy_response)
    pass = pass && test_equal(zlib.unzipSync(Buffer.from(dummy_response.data)).toString(), dummy_content, 'content_deflate as expected')

    cache.clear()

    return pass
  }
})

tests.push({
  test: () => {
    log('testing MemCache', NOTICE)

    let pass = true

    const cache = new MemCache()
    cache.clear()
    let dummy_request = { url: 'test/?x=y', headers: { 'accept-encoding': '' } }
    const dummy_content = '<test> foo bar baz </test>'
    const dummy_mimetype = 'dummy/mime'

    cache.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype)
    pass = pass && test_true(cache.has(dummy_request), 'mem cache entry present after adding')
    cache.clear()
    pass = pass && test_false(cache.has(dummy_request), 'mem cache entry not present after cache clear')
    cache.add(dummy_request, dummy_content, dummy_mimetype, dummy_mimetype)
    pass = pass && test_true(cache.has(dummy_request), 'mem cache entry present after re adding')
    cache.del(dummy_request)
    pass = pass && test_false(cache.has(dummy_request), 'mem cache entry not present after delete')
    const dummy_response = new ResponseWrapper()
    dummy_response.send = () => {}

    cache.add(dummy_request, dummy_content, dummy_mimetype, 200)
    cache.send(dummy_request, dummy_response)

    pass = pass && test_equal(dummy_response.data, dummy_content, 'content as expected')
    pass = pass && test_equal(dummy_response.contentType, dummy_mimetype, 'mimetype as expected')
    pass = pass && test_equal(dummy_response.responseCode, 200, 'status code as expected')

    dummy_request = { url: 'test/?x=y', headers: { 'accept-encoding': 'gzip,deflate' } }
    cache.add(dummy_request, dummy_content, dummy_mimetype, 200)
    cache.send(dummy_request, dummy_response)
    pass = pass && test_equal(zlib.gunzipSync(Buffer.from(dummy_response.data)).toString(), dummy_content, 'content_gzip as expected')

    dummy_request = { url: 'test/?x=y', headers: { 'accept-encoding': 'deflate,gzip' } }
    cache.add(dummy_request, dummy_content, dummy_mimetype, 200)
    cache.send(dummy_request, dummy_response)
    pass = pass && test_equal(zlib.unzipSync(Buffer.from(dummy_response.data)).toString(), dummy_content, 'content_deflate as expected')

    cache.clear()

    return pass
  }
})

tests.push({
  test: () => {
    log('testing helper functions', NOTICE)

    let pass = true

    let data = Helper.getAllPostIds(true)
    pass = pass && test_true(Array.isArray(data), 'getPosts (reverse) - return type is an array')
    pass = pass && test_equal(data.length, 2, 'getPosts (reverse) - return array length is 2')
    pass = pass && test_equal(data[0], '56cb9c69', 'getPosts (reverse) - return [0] equals "56cb9c69"')
    pass = pass && test_equal(data[1], '56cb9c4a', 'getPosts (reverse) - return [1] equals "56cb9c4a"')
    pass = pass && test_equal(Helper.getTitle(data[0]), 'aa  (new)', 'getTitle (reverse) - equals "aa  (new)"')
    pass = pass && test_equal(Helper.getTitle(data[1]), 'aa (old)', 'getTitle (reverse) - equals "aa (old)"')

    data = Helper.getAllPostIds(false)
    pass = pass && test_true(Array.isArray(data), 'getPosts - return type is an array')
    pass = pass && test_equal(data.length, 2, 'getPosts - return array length is 2')
    pass = pass && test_equal(data[0], '56cb9c4a', 'getPosts - return [0] equals "56cb9c4a"')
    pass = pass && test_equal(data[1], '56cb9c69', 'getPosts - return [1] equals "56cb9c69"')
    pass = pass && test_equal(Helper.getTitle(data[0]), 'aa (old)', 'getTitle - equals "aa (old)"')
    pass = pass && test_equal(Helper.getTitle(data[1]), 'aa  (new)', 'getTitle - equals "aa  (new)"')

    data = Helper.getTitles(true)
    pass = pass && test_true(Array.isArray(data), 'getTitles (reverse) - return type is an array')
    pass = pass && test_equal(data.length, 2, 'getTitles (reverse) - return array length is 2')
    pass = pass && test_equal(data[0], 'aa  (new)', 'getTitles (reverse) - return [0] equals "aa  (new)"')
    pass = pass && test_equal(data[1], 'aa (old)', 'getTitles (reverse) - return [1] equals "aa (old)"')

    data = Helper.getTitles(false)
    pass = pass && test_true(Array.isArray(data), 'getTitles - return type is an array')
    pass = pass && test_equal(data.length, 2, 'getTitles - return array length is 2')
    pass = pass && test_equal(data[0], 'aa (old)', 'getTitles - return [0] equals "aa (old)"')
    pass = pass && test_equal(data[1], 'aa  (new)', 'getTitles - return [1] equals "aa  (new)"')

    Helper.writePost('testpost', 'testcontent', 'testtitle')
    data = Helper.getPost('testpost')
    pass = pass && test_equal(data.title, 'testtitle', 'writePost / getPost - return title')
    pass = pass && test_equal(data.contents, 'testcontent', 'writePost / getPost - return contents')
    Helper.removePost('testpost')
    pass = pass && test_false(Helper.postExists('testpost'), 'removePost - remove "testpost"')

    return pass
  }
})

tests.push({
  test: () => {
    log('testing request handler: Find', NOTICE)

    let pass = true

    const find = new Find()
    const dummy_response = new ResponseWrapper()
    dummy_response.send = () => {}

    const dummy_request = {
      method: 'GET',
      url: '/find/'
    }
    let data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/ - should not be found')

    dummy_request.url = '/find/aa'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 200, '/find/aa - should be found')

    dummy_request.url = '/find/aaa'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/aaa - should not be found')

    dummy_request.url = '/find/////////////'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find///////////// - should not be found')

    dummy_request.url = '/find/\\\\\\\\\\\\\\'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/\\\\\\\\\\\\\\ - should not be found')

    dummy_request.url = '/find/.'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/. - should not be found')

    dummy_request.url = '/find/.......'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/....... - should not be found')

    dummy_request.url = '/find/+'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/+ - should not be found')

    dummy_request.url = '/find/++'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/++ - should not be found')

    dummy_request.url = '/find/*'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/* - should not be found')

    dummy_request.url = '/find/old'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 200, '/find/old - should be found')

    dummy_request.url = '/find/new'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 200, '/find/new - should be found')

    dummy_request.url = '/find/newold'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/newold - should not be found')

    dummy_request.url = "/find/<script>alert('hello')</script>"
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, "/find/<script>alert('hello')</script> - should not be found")

    dummy_request.url = '/find/<u>test</u>'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/find/<u>test</u> - should not be found')

    dummy_request.url = '/?q='
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q= - should not be found')

    dummy_request.url = '/?q=aa'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 200, '/?q=aa - should be found')

    dummy_request.url = '/?q=aaa'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=aaa - should not be found')

    dummy_request.url = '/?q=////////////'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=//////////// - should not be found')

    dummy_request.url = '/?q=\\\\\\\\\\\\\\'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=\\\\\\\\\\\\\\ - should not be found')

    dummy_request.url = '/?q=.'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=. - should not be found')

    dummy_request.url = '/?q=.......'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=....... - should not be found')

    dummy_request.url = '/?q=+'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=+ - should not be found')

    dummy_request.url = '/?q=++'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 200, '/?q=++ - should be found')

    dummy_request.url = '/?q=*'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=* - should not be found')

    dummy_request.url = '/?q=old'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 200, '/?q=old - should be found')

    dummy_request.url = '/?q=new'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 200, '/?q=new - should be found')

    dummy_request.url = '/?q=newold'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=newold - should not be found')

    dummy_request.url = "/?q=<script>alert('hello')</script>"
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, "/?q=<script>alert('hello')</script> - should not be found")

    dummy_request.url = '/?q=<u>test</u>'
    data = find.processRequest(dummy_request)
    pass = pass && test_equal(data.code, 404, '/?q=<u>test</u> - should not be found')

    return pass
  }
})

// TODO more tests!

for (let i = 0; i < tests.length; i++) {
  tests[i].test()
}

if (anyTestFailed) {
  log('A test has failed!', WARNING)
}
