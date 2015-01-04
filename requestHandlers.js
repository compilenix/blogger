var fonts = require('./requestHandlers/Fonts.js');

var Fonts = {};
Fonts["Regular"] = fonts.Regular;
Fonts["Regular_path"] = fonts.Regular_path;
Fonts["Bold"] = fonts.Bold;
Fonts["Regular_path"] = fonts.Regular_path;

exports.Index = require('./requestHandlers/Index.js').Index;
exports.Post = require('./requestHandlers/Post.js').Post;
exports.Favicon = require('./requestHandlers/Favicon.js').Favicon;
exports.Fonts = Fonts;
