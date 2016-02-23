"use strict";

function Edit(request) {
    return {
        type: "content",
        code: 200,
        content: fs.readFileSync("lib" + Helper.GetFsDelimiter() + Config.FileEditor, "utf8"),
        mimetype: "text/html"
    }
}

exports.Edit = Edit;
