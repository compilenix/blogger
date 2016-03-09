"use strict";

function Edit(request) {
    var content = Helper.prepareHeaderHtml("Editor", fs.readFileSync("lib" + Helper.GetFsDelimiter() + Config.FileEditor, "utf8"));

    return {
        type: "content",
        code: 200,
        content: content,
        mimetype: "text/html"
    };
}

exports.Edit = Edit;