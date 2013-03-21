var UglifyJS = require("uglify-js");
//var util = require('util');
var beautify = require('js-beautify').js_beautify;

function parse(code, options, debug) {
	var parms = [] ;
	var toplevel = UglifyJS.parse(code); 
	var walker = new UglifyJS.TreeWalker(function(node){
		if (node.end.type=="name"){
			//var test = util.inspect(node, showHidden=true, depth=4, colorize=true);
			var varName = node.end.value;
			if (!parms[varName]) {
				if (debug) console.log(node.end.value);
				if (code.indexOf("."+varName) === -1 && code.replace(/ /g, "").indexOf(varName+"(") == -1)  
					parms.push(varName); 
			}
			//console.log( node.end.type, node.end.value) ; 
			return true;
		} 
	});
	toplevel.walk(walker); 
	exports.parms = parms; // keep parms for mocha testing
	parms = JSON.stringify(parms).replace(/"/g,"").replace("[", "(").replace("]", ")");
	var cal = "extractedFunction"+parms;
	var fun = "function extractedFunction"+parms+"{"+code+"}";
	return beautify(fun+"\n\n"+cal, options);

	//console.log( result ) ; 
}

if (typeof exports !== "undefined"){
	exports.parse = parse; 
}
	
