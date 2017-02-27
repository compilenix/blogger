var htmlencode = require("htmlencode").htmlEncode;

var author = Config.author || "(no author)";
var authorMail = Config.authorMail || "foobar@foo.bar";
var CountPosts = Config.rss.CountPosts || 30;
var Description = Config.rss.Description || "(no description)";
var DirectoryPosts = Config.post.DirectoryPosts || "posts";
var Encoding = Config.rss.Encoding || "UTF-8";
var language = Config.language || "en";
var Link = Config.Link || "/";
var root = Config.root || "/";
var skipHours = Config.rss.skipHours || [0, 1, 2, 3, 4, 5];
var Title = Config.rss.Title || "Blog";
var ttl = Config.rss.ttl || 60;
var webMasterMail = Config.rss.webMasterMail || "foobar@foo.bar";
var webMaster = Config.rss.webMaster || "Admin";

function RSS(request, response, write_cache) {
	var posts = Helper.getPosts();
	var counter = 0;
	var data = "";
	var deps = [];

	// add rss header
	var dataToSend = generateRssHeader();

	for (var i = 0; i < posts.length; i++) {

		if (counter < CountPosts) {
			data = Helper.getPost(posts[i]);
			if (data !== "") {
				dataToSend += "<item>\n";

				// title
				dataToSend += "<title>" + htmlencode(data.title) + "</title>\n";
				// author
				dataToSend += "<author>" + authorMail + " (" + author + ")</author>\n";
				// link
				dataToSend += "<link>" + Link + root + "post/" + posts[i] + "</link>\n";
				// guid
				dataToSend += "<guid>" + Link + root + "post/" + posts[i] + "</guid>\n";
				// date
				dataToSend += "<pubDate>" + new Date(parseInt(posts[i], 16) * 1000).toUTCString() + "</pubDate>\n";
				// content (html)
				dataToSend += "<description><![CDATA[" + data.contents + "]]></description>\n";

				dataToSend += "</item>\n\n";
				deps.push(DirectoryPosts + Helper.GetFsDelimiter() + posts[i] + ".json");
				counter++;
			}
		}
	}

	dataToSend += "</channel>\n";
	dataToSend += "</rss>\n";

	return {
		type: "content",
		code: 200,
		content: dataToSend,
		mimetype: "application/rss+xml"
	};
}

function generateRssHeader() {
	var skipHoursString = "";
	for (let i = 0; i < skipHours.length; i++) {
		skipHoursString += "<hour>" + skipHours[i] + "</hour>\n";
	}

	var data = "<?xml version=\"1.0\" encoding=\"" + Encoding + "\"?>\n";
	data += "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n";
	data += "<channel>\n";
	data += "<title>" + htmlencode(Title) + "</title>\n";
	data += "<link>" + Link + root +"</link>\n";
	data += "<atom:link href=\"" + Link + "/rss.xml\" rel=\"self\" type=\"application/rss+xml\" />\n";
	data += "<description>" + Description + "</description>\n";
	data += "<generator>" + Config.ServerVersion + "</generator>\n";
	data += "<ttl>" + ttl + "</ttl>\n";
	if (skipHoursString !== "") { data += "<skipHours>\n" + skipHoursString + "</skipHours>\n"; }
	data += "<webMaster>" + webMasterMail + " (" + webMaster + ")</webMaster>\n";
	data += "<language>" + language + "</language>\n\n";

	return data;
}


exports.RSS = RSS;
