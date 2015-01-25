var fonts_version = "0.80";

var Config = {
    root: "/",
    language: "en",
    author: "Compilenix",
    authorMail: "Compilenix@compilenix.org",
    Link: "http://127.0.0.1",
    server: {
        port: 8000
    },
    post: {
        FileHeader: "header.html",
        DirectoryPosts: "posts",
        DeliverPgpSignatures: true, // if available
        CountPosts: 5,
        MessageNextPage: "Next",
        MessageLastPage: "Prev",
        MessageEnd: "The end."
    },
    rss: {
        CountPosts: 30,
        Description: "We do what we must, because we can!",
        Encoding: "UTF-8",
        skipHours: [0, 1, 2, 3, 4, 5, 6, 7],
        Title: "Compilenix's Blog",
        ttl: 60, // minutes
        webMaster: "Compilenix@compilenix.org"
    },
    area: {
        internal: [
            "192.168.0.0/16",
            "127.0.0.0/8",
            "172.16.0.0/16",
            "10.0.0.0/8",
            "94.135.215.26"
        ],
        external: [
            "*"
        ]
    },
    fonts: {
        Regular_path: "cdn/fonts/ubuntu-font-family-" + fonts_version + "/Ubuntu-R.ttf",
        Bold_path: "cdn/fonts/ubuntu-font-family-" + fonts_version + "/Ubuntu-B.ttf"
    },
    threads: 1
    // threads: _OS.cpus().length
};


exports.Config = Config;
