var fonts_version = "0.80";

var Config = {
    root: "/",
    server: {
        port: 8000
    },
    post: {
        FileHeader: "header.html",
        DirectoryPosts: "posts",
        CountPosts: 3,
        MessageNextPage: "Next",
        MessageLastPage: "Prev",
        MessageEnd: "The end."
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
