Javascript Refactor Sublime2 plugin
===============================

Overview
========

It is possible to select Javascript source code and extract it instantly to a new methode aka function. The plugin will manage undeclared variable usages and pass them within a single bundled JSON parameter to the new function.
It als generates a sample function call at the bottom of the new methode.


Installation
============

Use the Sublime Package Control and search for: "refactor" (NOT ACTIVE SO FAR!)

or

1. Clone or download git repo into your packages folder (in ST2, find Browse Packages... menu item to open this folder)
2. Rename the Plugin Folder from "sublime-text-refactor" to "Refactor" !!!


Dependencies
============
- http://nodejs.org

Usage
=====

Select the source code you want to extract into a new method. Use the context menu Refactor / Extract methode. Rename function parm on the fly.


Todo for Javascript files
========================

- Let the user choose a function name before or after extraction
- Let the user choose a custom position to insert extracted methode code and indent it correctly
- Rename local scoped variable
- Goto variable definition


License
=======


MIT and GPL license.

Copyright (c) 2013 Stephan Ahlf <stephan@ahlf-it.de>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.