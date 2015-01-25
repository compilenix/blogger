var fonts = require('./requestHandlers/Fonts.js');

var Fonts = {};
Fonts["Regular"] = fonts.Regular;
Fonts["Regular_path"] = _Config.fonts.Regular_path;
Fonts["Bold"] = fonts.Bold;
Fonts["Regular_path"] = _Config.fonts.Regular_path;

replaceAll = function (find, replace, str) {
  return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

exports.Index = require('./requestHandlers/Index.js').Index;
exports.Post = require('./requestHandlers/Post.js').Post;
exports.RSS = require('./requestHandlers/rss.js').RSS;
exports.Favicon = require('./requestHandlers/Favicon.js').Favicon;
exports.Fonts = Fonts;
