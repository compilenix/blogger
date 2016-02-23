"use strict";

var DirectoryStatic = Config.post.DirectoryStatic || "static";

function Static(request) {

    var file = querystring.parse(url.parse(request.url).query)["f"];

    var response = {
        type: "error",
        code: 404,
        content: "file not found!",
        mimetype: "text/plain"
    }

    if (file) {
        var fileList = fs.readdirSync(DirectoryStatic);

        if (fileList.indexOf(file) != -1) {
            response.type = file;
            response.code = 200;
            var extension = file.split(".").reverse()[0] || "";

            switch (extension) {
                case "js":
                    response.mimetype = "text/javascript";
                break;
                case "png":
                    response.mimetype = "image/png";
                break;
                case "css":
                    response.mimetype = "text/css";
                break;
            }
            
            response.content = DirectoryStatic + Helper.GetFsDelimiter() + file;
        }
    }

    return response;
}

exports.Static = Static;
