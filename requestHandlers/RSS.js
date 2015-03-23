var author = _Config.author || "(no author)";
var authorMail = _Config.authorMail || "foobar@foo.bar";
var CountPosts = _Config.rss.CountPosts || 30;
var Description = _Config.rss.Description || "(no description)";
var DirectoryPosts = _Config.post.DirectoryPosts || "posts";
var Encoding = _Config.rss.Encoding || "UTF-8";
var language = _Config.language || "en";
var Link = _Config.Link || "/";
var root = _Config.root || "/";
var skipHours = _Config.rss.skipHours || [0, 1, 2, 3, 4, 5];
var Title = _Config.rss.Title || "Blog";
var ttl = _Config.rss.ttl || 60;
var webMasterMail = _Config.rss.webMasterMail || "foobar@foo.bar";
var webMaster = _Config.rss.webMaster || "Admin";

function RSS(request, response, write_cache) {
	var posts = _helper.getPosts();
	var counter = 0;
	var data = "";
	var deps = [];

	// add rss header
	var dataToSend = generateRssHeader();

	for (var i = 0; i < posts.length; i++) {

		if (counter < CountPosts) {
			data = _helper.getPost(posts[i]);
			if (data !== '') {
				dataToSend += "<item>\n";

				// title
				dataToSend += '<title>' + data.title + '</title>\n';
				// author
				dataToSend += "<author>" + authorMail + " (" + author + ")</author>\n";
				// link
				dataToSend += "<link>" + Link + root + "post/?p=" + posts[i] + "</link>\n";
				// guid
				dataToSend += "<guid>" + Link + root + "post/?p=" + posts[i] + "</guid>\n";
				// date
				dataToSend += "<pubDate>" + new Date(parseInt(posts[i], 16) * 1000).toUTCString() + "</pubDate>\n";
				// content (html)
				dataToSend += "<description><![CDATA[" + data.contents + "]]></description>\n"

				dataToSend += "</item>\n\n";
				deps.push(DirectoryPosts + '/' + posts[i] + '.json');
				counter++;
			}
		}
	}

	dataToSend += '</channel>\n';
	dataToSend += '</rss>\n';
	response.setResponseCode(200);
	response.setContentType('application/rss+xml');
	response.setContent(dataToSend);
	if (write_cache) {
		_cache.add(request, response.getContent(), response.getContentType(), response.getResponseCode(), deps);
		response.setLastModified(_cache.getLastModified(request));
	}
	response.send();
}

function generateRssHeader() {
	var skipHoursString = "";
	for (var i = 0; i < skipHours.length; i++) {
		skipHoursString += "<hour>" + skipHours[i] + "</hour>\n";
	}

	var data = '<?xml version="1.0" encoding="' + Encoding + '"?>\n';
	data += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
	data += '<channel>\n';
	data += '<title>' + Title + '</title>\n';
	data += '<link>' + Link + root +'</link>\n';
	data += '<atom:link href="' + Link + '/rss.xml" rel="self" type="application/rss+xml" />\n';
	data += '<description>' + Description + '</description>\n';
	data += '<generator>' + 'node.js/' + process.version + '</generator>\n';
	data += '<ttl>' + ttl + '</ttl>\n';
	if (skipHoursString !== "") { data += '<skipHours>\n' + skipHoursString + '</skipHours>\n'; }
	data += "<webMaster>" + webMasterMail + " (" + webMaster + ")</webMaster>\n";
	data += '<language>' + language + '</language>\n\n';

	return data;
}


exports.RSS = RSS;
