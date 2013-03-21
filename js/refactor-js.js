/*
  Written by Stephan Ahlf 
*/
var parse = require("./parse").parse;
 

function refactor (sourceCodeText, options) {
    var beautify = null; 
    try {
        beautify = require('js-beautify').js_beautify;
    } catch( e ) {
        if ( e.code === 'MODULE_NOT_FOUND' )  throw("cannot find js-beautify. Please install this module via 'npm install --global js-beautify'.");
    }
    result = parse(sourceCodeText,options);
    //beautify(sourceCodeText, options);
    return result;
}

if (typeof exports !== "undefined")
    exports.refactor = refactor;