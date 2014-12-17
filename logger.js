var morgan = require('morgan');
var fs = require('fs');

// Initialze additional components
var logger_console = morgan('dev');
var logger_file = morgan('combined');
var accessLogStream = undefined;
var LoggingFile = false;
var LoggingFileType = "combined";
var LogFile = __dirname + "/access.log";

// Getter/Setter functions (to be exported)
var Options = {
    LoggingConsole: true,
    LoggingConsoleType: "dev",
    
    set LoggingFile(newBool) { LoggingFile = newBool; init_LoggingFile(); },
    set LoggingFileType(newType) { LoggingFileType = newType; init_LoggingFile(); },
    set LogFile(newFile) { LogFile = newFile; init_LoggingFile(); },
    
    init_LoggingFile: function () {
        accessLogStream = fs.createWriteStream(LogFile, { flags: 'a' });
        logger_file = morgan(Options.LoggingFileType, { stream: accessLogStream });
    }
}

// "Main"-Function
function Log(req, res, err) {
    
    if (Options.LoggingConsole === true) {
        logger_console(req, res, err);
    }
    
    //TODO implement
    if (Options.LoggingFile === true) {
        if (accessLogStream === undefined) {
            Options.init_LoggingFile();
        }
        //logger_console(req, res, err);
        throw "Not yet implemented";
    }
}


exports.Log = Log;
exports.Options = Options;
