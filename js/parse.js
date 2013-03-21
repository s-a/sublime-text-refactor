var UglifyJS = require("uglify-js");
var beautify = require('js-beautify').js_beautify;
var util = require("util");
 
var normalizedCode = null; 

function parse(code, options, debug){
	normalizedCode = code.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").replace(/ /g, ""); // fime: this is ugly to test if node is a function call
	 
	var parms = [] ;
	var toplevel = UglifyJS.parse(code);
	toplevel.figure_out_scope();
	var walker = new UglifyJS.TreeWalker(function(node){
		var varName = node.end.value;
		var isVar = (node.end.type === "name" && varName !== "console");
		var isKeyword = false;

		if (node.thedef && isVar && !isKeyword){
			var varUndeclared  = node.thedef.undeclared;  
			var varNested = (node.scope.nesting !== 0);
			if ( !varNested && varUndeclared ){
				var isFunctionCall = (normalizedCode.indexOf(varName+"(") !== -1);
				//console.log(varName, isFunctionCall);
				//if (varName==="done") console.log(util.inspect(node.scope.cname, showHidden=true, depth=1, colorize=true)); 
				if (!isFunctionCall && parms.indexOf(varName) === -1 ) {
					parms.push(varName); 
				} 
				return true;
			} 
		}
	});
	toplevel.walk(walker); 
	exports.parms = parms; // keep parms for mocha testing
	parms = JSON.stringify(parms).replace(/"/g,"").replace("[", "(").replace("]", ")");
	var cal = "extractedFunction"+parms+";";
	var fun = "function extractedFunction"+parms+"{"+code+"};";
	var result = beautify(fun+"\n\n"+cal, options);

	return result;

	//console.log( result ) ; 
}

if (typeof exports !== "undefined"){
	exports.parse = parse; 
}
	
