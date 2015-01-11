var fonts_version = "0.80";

var Config = {
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
    fonts: {
        Regular_path: "cdn/fonts/ubuntu-font-family-" + fonts_version + "/Ubuntu-R.ttf",
        Bold_path: "cdn/fonts/ubuntu-font-family-" + fonts_version + "/Ubuntu-B.ttf"
    },
    root: "/",
    // threads: 1
    threads: _OS.cpus().length
};


exports.Config = Config;
