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

function extractMethod(code, tempFile, options, debug){
	normalizedCode = beautify(code); 
	var orignialCode = code; 
	var parms = [] ; 
	var parmsJSON = [];
	var toplevel = UglifyJS.parse(normalizedCode, { bare_returns : true });
	toplevel.figure_out_scope();

	var stream = new UglifyJS.OutputStream({
		comments : true,
		preserve_line : false,
		
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

	/*
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
	fs.writeFileSync(tempFile, JSON.stringify(variablePositions));
	*/
	return result; 
}

var i =0;
function findInScopes(name, currentScope, type){
	var result = null;
	var parentScope = currentScope.parent_scope;
	if (currentScope[type] && currentScope[type]._values[name]) result = currentScope[type]._values[name].orig[0];
	if (result === null && parentScope ){
		result = findInScopes(name, parentScope, type);
	}
	return result;
}

function findDeclaration (code, codePosition, debug) {
	var toplevel = UglifyJS.parse(code);
	toplevel.figure_out_scope();
	var result = null;
	var walker = new UglifyJS.TreeWalker(function(node){
		var varName = node.start.value;
		
		if (node.start.pos <= codePosition && node.start.endpos >= codePosition && node.scope){
			if (node.thedef && node.thedef.references && node.thedef.references[0]){
				var n = "$"+varName; 
				var org = findInScopes(n, node.scope, "variables");
				if (org === null) org = findInScopes(n, node.scope, "functions");
				//if (node.scope.variables._values[n]) org = .variables._values[n].orig[0];
				//if (org===null && debug) console.log(node.scope.parent_scope);

				var originalPosition = org.start;
				result = {
					begin : originalPosition.pos,
					end : originalPosition.endpos,
					line : originalPosition.line
				};
				if (debug){
					//var res = util.inspect(result, showHidden=false, depth=1, colorize=true);	
					console.log("Found " + varName + "'s used(" + codePosition + ") ", result);
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
		if (!debug) result = JSON.stringify(result);
		return result;
	}
}

function renameVariable (code, codePosition, debug, tempFile) {
	var toplevel = UglifyJS.parse(code);
	toplevel.figure_out_scope();
	var result = null;
	var walker = new UglifyJS.TreeWalker(function(node){
		var varName = node.start.value;
		result = [];
		
		if (node.start.pos <= codePosition && node.start.endpos >= codePosition && node.scope){	
			if (node.thedef && node.thedef.references && node.thedef.references[0]){
				//var NODE = util.inspect(node.thedef.references[0].start, showHidden=false, depth=2, colorize=false);
				var references = node.thedef.references;
				for (var i = 0; i < references.length; i++) {
					var ref = references[i].start;
					result.push( [ref.pos+1, ref.endpos+1] );
				}
				var n = "$"+varName; 
				var org = findInScopes(n, node.scope, "variables");
				if (org === null) org = findInScopes(n, node.scope, "functions");
				//if (node.scope.variables._values[n]) org = .variables._values[n].orig[0];
				//if (org===null && debug) console.log(node.scope.parent_scope);

				var originalPosition = org.start;
				result.push( [originalPosition.pos+1, originalPosition.endpos+1] );
				if (debug){
				}
				fs.writeFileSync(tempFile, JSON.stringify(result));
			}
		}
	});	
	toplevel.walk(walker); 
}

if (typeof exports !== "undefined"){
	exports.extractMethod = extractMethod; 
	exports.findDeclaration = findDeclaration;
	exports.renameVariable = renameVariable;
}