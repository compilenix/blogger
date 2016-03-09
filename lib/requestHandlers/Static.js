"use strict";

function Static(request) {
    const file = querystring.parse(url.parse(request.url).query)["f"];
    const response = {
        type: "error",
        code: 404,
        content: "file not found!",
        mimetype: "text/plain"
    };
    if (file) {
        const path = Helper.replaceAll("/", Helper.GetFsDelimiter(), Config.staticContentPath);
        const fileList = fs.readdirSync(path);
        if (fileList.indexOf(file) != -1) {
            response.type = "content";
            response.content = fs.readFileSync(path + Helper.GetFsDelimiter() + file, "utf8");
            response.code = 200;
            const extension = file.split(".").reverse()[0] || "";
            switch (extension) {
                case "js":
                    response.mimetype = "text/javascript";
                    break;
                case "css":
                    response.mimetype = "text/css";
                    break;
                case "png":
                    response.mimetype = "image/png";
                    break;
                default:
                    response.mimetype = "application/octet-stream";
                    break;
            }
        }
    }

    return response;
}

exports.Static = Static;