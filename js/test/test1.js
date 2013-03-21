var assert = require("assert");
var parser = require("../parse");
var code = 'var n = a; x=y; var L = xyz;var xxx = function FAFA(gaga1){var gaga2=0; gaga3=fafa4;} ;status.show	(x);\n// todo: \nconsole.log (xyz, "todo: // tests.", params);this.leaveMeAlone;done();';
parser.parse(code, null, true); 

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

describe('Parser of Javascript Source Code', function(){
	describe('#parser.parse()', function(){
		
		it('should contain', function(){
			assert.notEqual(parser.parms.indexOf("a"),-1);
			assert.notEqual(parser.parms.indexOf("y"),-1);
			assert.notEqual(parser.parms.indexOf("xyz"),-1);
			assert.notEqual(parser.parms.indexOf("params"),-1); 

			assert.notEqual(parser.parms.indexOf("status"),-1);
			assert.notEqual(parser.parms.indexOf("x"),-1);
		});
		it('should not contain', function(){ 
			assert.equal(parser.parms.indexOf("n"),-1);
			assert.equal(parser.parms.indexOf("FAFA"),-1);
			assert.equal(parser.parms.indexOf("gaga3"),-1);
			assert.equal(parser.parms.indexOf("this"),-1);
			assert.equal(parser.parms.indexOf("leaveMeAlone"),-1);
 
			assert.equal(parser.parms.indexOf("fafa4"),-1);
			assert.equal(parser.parms.indexOf("gaga2"),-1);
			assert.equal(parser.parms.indexOf("gaga1"),-1);
			assert.equal(parser.parms.indexOf("xxx"),-1);

			assert.equal(parser.parms.indexOf("done"),-1); 
			assert.equal(parser.parms.indexOf("console"),-1);
		});

		it('should not contain dublicates', function() {
			assert.equal(hasDuplicates(parser.parms), false, parser.parms);
		});
	});
}); 