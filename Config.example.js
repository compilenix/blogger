const os = require("os");
const fs = require("fs");

/** @type {Config} */
let instance;

class Config {
	constructor() {
		this.Version = "1";
		this.root = "/";
		this.language = "en";
		this.author = "user";
		this.authorMail = "user@domain.tld";
		this.Link = "http://127.0.0.1";
		this.Title = "My Blog";
		this.DirectoryCache = "cache";
		this.HeaderExpires = 60000 * 60; // 60 Minutes
		this.ClearCacheOnStart = false;
		this.DevMode = false;
		this.MaxHttpPOSTSize = 5e7; // 50 Megabyte
		this.HandleClientCacheControl = true;
		this.DefaultContentType = "text/html";
		this.ServerVersion = `node.js/${process.version}`;
		this.cache = "FsCache"; // "MemCache" | "FsCache" | "none"
		this.FileEditor = "editor.html";
		this.ApiKey = "changeme";

		this.Log = {
			Level: "Info", // "Debug", "Info", "Warn", "Error"
			File: {
				Enabled: true,
				Path: "log",
				FilePerLoglevel: true
			},
			Console: {
				Enabled: true
			}
		};

		this.server = {
			port: 8000
		};

		this.Https = {
			Enabled: false,
			Key: fs.readFileSync("./localhost.key"),
			Cert: fs.readFileSync("./localhost.crt")
		};
		this.EnableHttp2 = false; // for this option you must enable and configure "Https" otherwise the application will automatically fallback to plain HTTP!

		this.post = {
			FileHeader: "header.html",
			FileFooter: "footer.html",
			DirectoryPosts: "posts",
			CountPosts: 20,
			MessageOlderPage: "Older",
			MessageNewerPage: "Newer",
			essageEnd: "The end."
		};

		this.rss = {
			CountPosts: 100,
			Description: "Some Description",
			Encoding: "UTF-8",
			skipHours: [0, 1, 2, 3, 4, 5, 6, 7],
			Title: "Some Title",
			ttl: 60, // minutes
			webMaster: "Admin",
			webMasterMail: "admin@domain.tld"
		};

		this.Fonts = {
				Ubuntu: {
					Regular: "Ubuntu-R.ttf",
					Bold: "Ubuntu-B.ttf"
				},
				SourceCodePro: {
					Regular: {
						EmbeddedOpentype: "SourceCodePro-Regular.eot",
						Woff2: "SourceCodePro-Regular.ttf.woff2",
						Woff: "SourceCodePro-Regular.otf.woff",
						Opentype: "SourceCodePro-Regular.otf",
						Truetype: "SourceCodePro-Regular.ttf"
					},
					Bold: {
						EmbeddedOpentype: "SourceCodePro-Bold.eot",
						Woff2: "SourceCodePro-Bold.ttf.woff2",
						Woff: "SourceCodePro-Bold.otf.woff",
						Opentype: "SourceCodePro-Bold.otf",
						Truetype: "SourceCodePro-Bold.ttf"
					},
					Italic: {
						EmbeddedOpentype: "SourceCodePro-It.eot",
						Woff2: "SourceCodePro-It.ttf.woff2",
						Woff: "SourceCodePro-It.otf.woff",
						Opentype: "SourceCodePro-It.otf",
						Truetype: "SourceCodePro-It.ttf"
					},
					BoldItalic: {
						EmbeddedOpentype: "SourceCodePro-BoldIt.eot",
						Woff2: "SourceCodePro-BoldIt.ttf.woff2",
						Woff: "SourceCodePro-BoldIt.otf.woff",
						Opentype: "SourceCodePro-BoldIt.otf",
						Truetype: "SourceCodePro-BoldIt.ttf"
					}
				}
			},

			this.staticContentPath = "static/";
		this.staticContentUri = "/static/?f=";
		this.threads = os.cpus().length;
		this.templatePath = "templates/";
	}
}

/**
 * @returns {Config}
 */
function getConfig() {
	if (!instance) {
		instance = new Config();
	}

	return instance;
}

module.exports = getConfig();
