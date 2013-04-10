var assert = require("assert");
var parser = require("../parse");
var code = '		var u=undefined;var n = a; SKA=y;  var L = xyz;var xxx = function FAFA(VAR1){var VAR2=0; VAR3=fafa4;} ;			status.show	(bar);\n// todo: \nconsole.log (xyz, "todo: ", params);this.leaveMeAlone();done (""); var obj = {type1:String, type2:Number, customtype:number};';
var parsedCode = parser.extractMethod(code, null, true); 

function hasDuplicates(array) {
    var valuesSoFar = {};
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (Object.prototype.hasOwnProperty.call(valuesSoFar, value)) {
        	console.log(array);
            return true;
        }
        valuesSoFar[value] = true;
    }
    return false;
}

describe('Parse and extract Methods', function(){
	describe('#parser.extractMethod()', function(){
		
		it('should contain', function(){
			assert.notEqual(parser.parms.indexOf("a"),-1);
			assert.notEqual(parser.parms.indexOf("y"),-1);
			assert.notEqual(parser.parms.indexOf("xyz"),-1);
			assert.notEqual(parser.parms.indexOf("params"),-1); 
			assert.notEqual(parser.parms.indexOf("status"),-1);
			assert.notEqual(parser.parms.indexOf("SKA"),-1);
			assert.notEqual(parser.parms.indexOf("number"),-1);
		});

		it('should not contain', function(){ 
			assert.equal(parser.parms.indexOf("n"),-1);
			assert.equal(parser.parms.indexOf("FAFA"),-1);
			assert.equal(parser.parms.indexOf("VAR3"),-1);
			assert.equal(parser.parms.indexOf("this"),-1);
			assert.equal(parser.parms.indexOf("leaveMeAlone"),-1);
 
			assert.equal(parser.parms.indexOf("fafa4"),-1);
			assert.equal(parser.parms.indexOf("VAR2"),-1);
			assert.equal(parser.parms.indexOf("VAR1"),-1);
			assert.equal(parser.parms.indexOf("xxx"),-1);

			assert.equal(parser.parms.indexOf("done"),-1); 
			assert.equal(parser.parms.indexOf("console"),-1);
			assert.equal(parser.parms.indexOf("Number"),-1);
			assert.equal(parser.parms.indexOf("String"),-1);
			assert.equal(parser.parms.indexOf("undefined"),-1);
		});

		it('should not contain dublicates', function() {
			assert.equal(hasDuplicates(parser.parms), false, parser.parms);
		}); 
	});
}); 