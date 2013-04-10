var fs = require("fs");
var assert = require("assert");
var parser = require("../parse");
var code = '		var u=undefined;var n = a; SKA=y;  var L = xyz;var xxx = function FAFA(VAR1){var VAR2=0; VAR3=fafa4;} ;			status.show	(bar);\n// todo: \nconsole.log (xyz + L, "todo: ", params);this.leaveMeAlone();done ("LOL"); var obj = {type1:String, type2:Number, customtype:number};';
var jqueryCode = fs.readFileSync("./testfile2.js", "utf8");
var res = null;
//var res3 = parser.findDeclaration(code, null, true); 

 

describe('Find variables and functions', function(){
	describe('#parser.findDeclaration()', function(){
		
		it('Declarations that should be undefined', function(){
			res = parser.findDeclaration(jqueryCode, -1, true); 
			assert.equal(res, -1);
		});

		it('Declarations that should be found', function(){
			res = parser.findDeclaration(jqueryCode, 213843, true);
			assert.equal(res, 213564, "Keyword callback");

			res = parser.findDeclaration(jqueryCode, 214053, true); 
			assert.equal(res, 207912, "Keyword ajaxLocation");

			res = parser.findDeclaration(jqueryCode, 208385, true); 
			assert.equal(res, 1530, "Keyword jQuery");
			res = parser.findDeclaration(jqueryCode, 213867, true); 
			assert.equal(res, 1530, "Keyword jQuery");

			
		}); 
	});
});