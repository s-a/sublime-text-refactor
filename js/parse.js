var UglifyJS = require("uglify-js");
var beautify = require('js-beautify').js_beautify;
var fs = require("fs");
var path = require("path");
var util = require("util");
 
var normalizedCode = null; 
var extractedFunctionName = "FU";
var parmsName = "extractedMethodSettings";

var isJavascriptKeyword;
(function() {
	isJavascriptKeyword = function testJavascriptKeyword (argument) {
		var type = "undefined";
		try {
			if (argument === type){
				return true;
			} else {
				eval("type = typeof " + argument + ";");
			}
		} catch (e) {
		} finally {
			//console.log(type);
		}
		 
		return type !== "undefined";
	};
})();

function extractMethod(code, options, debug){
	normalizedCode = beautify(code); 
	var orignialCode = code; 
	var parms = [] ; 
	var parmsJSON = [];
	var toplevel = UglifyJS.parse(normalizedCode);
	toplevel.figure_out_scope();
	var stream = UglifyJS.OutputStream({
		comments : true,
		preserve_line : false
	});
    
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
	var fun = "function "+extractedFunctionName+"("+parmsName+"){"+stream+"}";
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

	var resultCode = UglifyJS.parse( beautify(fun) );
	resultCode.figure_out_scope();
	var variablePositions = [];
	var walker2 = new UglifyJS.TreeWalker(function(node){
		var varName = node.start.value;
		if (varName === parmsName){
			var pos = [node.start.pos,node.start.endpos];
			variablePositions.push(pos);
		}
	});	
	resultCode.walk(walker2); 
	fs.writeFileSync(path.join(__dirname, "../resultCodePositions.json"), JSON.stringify(variablePositions));
	return result; 
}

function findDeclaration (code, codePosition, debug) {
	var toplevel = UglifyJS.parse(code);
	toplevel.figure_out_scope();
	var result = null;
	var walker = new UglifyJS.TreeWalker(function(node){
		var varName = node.start.value;
		if (node.start.pos === codePosition){
			if (node.thedef && node.thedef.references && node.thedef.references[0]){
				var n = "$"+varName;
				var originalPosition = node.scope.variables._values[n].orig[0].start;
				result = {
					begin : originalPosition.pos,
					end : originalPosition.endpos
				};
				if (debug){
					res = util.inspect(result, showHidden=false, depth=1, colorize=true);	
					console.log("Found " + varName + "'s declaration at ", result);
				}
			}
		}
	});	
	toplevel.walk(walker); 
	//var ref = null;
	//var res; //debug
	//	var functions = util.inspect(node.scope.functions, showHidden=false, depth=2, colorize=true);
	//var variables = util.inspect(currentNode.scope.variables, showHidden=false, depth=2, colorize=true);
	//var refs = util.inspect(currentNode.scope.variables._values.$callback.orig[0].start.pos, showHidden=false, depth=1, colorize=true);
	//console.log(refs);
	//console.log(variables);

	if (result === null){
		return -1;
	} else {
		return result.begin;
	}
	
}

if (typeof exports !== "undefined"){
	exports.extractMethod = extractMethod; 
	exports.findDeclaration = findDeclaration;
}