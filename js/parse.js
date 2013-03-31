var UglifyJS = require("uglify-js");
var beautify = require('js-beautify').js_beautify;
var util = require("util");
 
var normalizedCode = null; 
var extractedFunctionName = "FU";
var parmsName = "settings";
String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
var isJavascriptKeyword;
(function() {
	isJavascriptKeyword = function testJavascriptKeyword (argument) {
		var type = "undefined";
		try {
			eval("type = typeof " + argument + ";");
		} catch (e) {
		} finally {
			//console.log(type);
		}
		 
		return type !== "undefined";
	}
})();

function parse(code, options, debug){
	normalizedCode = beautify(code); 

	var orignialCode = code; 
	var parms = [] ; 
	var parmsJSON = [];
	var toplevel = UglifyJS.parse(normalizedCode);
	toplevel.figure_out_scope();
	var stream = UglifyJS.OutputStream();
    
	var walker = new UglifyJS.TreeWalker(function(node){
		var varName = node.end.value;
		var isVar = (node.end.type === "name"); 

		if (node.thedef && isVar && !isJavascriptKeyword(varName)){
			if (true){
				var varUndeclared  = node.thedef.undeclared;  
				var varNested = (node.scope.nesting !== 0);
				var nextChar = normalizedCode.substring(node.start.endpos, node.start.endpos+1);
				var isFunctionCall = (nextChar === "(");  

				if ( !varNested && varUndeclared ){  
					//if (varName==="String") console.log( node); 
					if (!isFunctionCall && parms.indexOf(varName) === -1 ) {
						parms.push(varName);
						parmsJSON.push(varName + ":" + varName );
						node.thedef.mangled_name = parmsName + "." + varName;
					}   
				} 
			}
		}
	});
	toplevel.walk(walker); 
	toplevel.print(stream);
	 
	exports.parms = parms; // keep parms for mocha testing

	parms = JSON.stringify(parmsJSON).replace(/"/g,"").replace("[", "({").replace("]", "})");
	var cal = extractedFunctionName+parms+";";
	var fun = "function "+extractedFunctionName+"("+parmsName+"){"+stream+"};";
	exports.fu = fun; // keep extracted function string for mocha testing
	var result = beautify(fun+"\n\n"+cal, options);
	if (debug) {

		console.log("-");
		console.warn("// Original selected Source Code:");
		console.log(beautify(orignialCode));
		console.log("-");
		console.log("// Extracted Methode from original selected Source Code:");
		console.log(beautify(fun));
		console.log("-");
		console.log("// Extracted Methode call from original selected Source Code:");
		console.log(beautify(cal));
	}

	return result;

	//console.log( result ) ; 
}

if (typeof exports !== "undefined"){
	exports.parse = parse; 
}
	
