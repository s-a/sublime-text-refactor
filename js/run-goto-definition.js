/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

 /*global console, process, require, __dirname */

 (function() {
  "use strict"; 


  var i, len, hash, key, value, raw,

    // cache the console log function and the process arguments
    log = console.log,
    argv = process.argv,

    // require path and file system utilities to load the jshint.js file
    path = require('path'),
    fs = require('fs'),

    // the source file to be linted and options
    source = argv[2] || "",
    option = {};

    // the refactor functions work when global by dependance
    global.findDeclaration = require(path.join(__dirname, "refactor-js.js")).findDeclaration;

    var codePosition = argv[3];
    if (source.match(".js" + "$") == ".js") { 
      var sourceCode = fs.readFileSync(source, "utf8");
      var result = findDeclaration(sourceCode, parseInt(codePosition,10) , false);
      log(result);
    }
 
}());
