replaceAll = function (find, replace, str) {
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

exports.Index = require('./requestHandlers/Page.js').Index;
exports.Post = require('./requestHandlers/Post.js').Post;
exports.RSS = require('./requestHandlers/RSS.js').RSS;
exports.Page = require('./requestHandlers/Page.js').Page;
