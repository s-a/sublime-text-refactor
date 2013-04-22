Javascript Refactor Sublime2 plugin
===============================

Overview
========

- Extract method
- Goto definition


Installation
============

Use the Sublime Package Control and search for: "refactor" (NOT ACTIVE SO FAR!)

or

Clone or download the git repository into your packages folder (in ST2, find Browse Packages... menu item to open this folder)

Dependencies
============
- http://nodejs.org
- mocha (only for testing)

Usage
=====

Extract Method:
Select the source code you want to extract into a new method and choose "Refactor / Extract methode" from context menu. 
This will extract the source code instantly to a new methode aka function. The plugin will manage undeclared variable usages and pass them within a single bundled JSON parameter to the new function.
It als generates a sample function call at the bottom of the new methode.
The plugin marks all variables occurring in the source code so you can rename them on the fly. 

Goto Definition:
Select a keyword via double click and choose "Goto Definition" from context menu. So far this is limited by type of selection! You have to point the cursor direct before the first character of the keyword.


Run the tests
=============
Goto Pluginfolder into the subfolder js and simply type "mocha". To Add more tests you can save a Javascript File into the subfolder ./js/test.
You can find an examples of current test cases here... 
https://github.com/s-a/sublime-text-refactor/blob/master/js/test/extractmethode.js
https://github.com/s-a/sublime-text-refactor/blob/master/js/test/findDeclaration.js


Todo for Javascript files
========================
- Define exceptions of global scoped variable names like jQuery or $.
- Let the user choose a function name before or after extraction.
- Let the user choose a custom position to insert extracted methode code and indent it correctly.
- Rename local scoped variable.


License
=======


MIT and GPL license.

Copyright (c) 2013 Stephan Ahlf <stephan@ahlf-it.de>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.