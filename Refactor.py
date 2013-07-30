import subprocess
import sublime
import sublime_plugin
import os
import os.path
import json
import platform
from os.path import dirname, realpath
import tempfile
from datetime import datetime


REFACTOR_PLUGIN_FOLDER = dirname(realpath(__file__)) + "/"

ALL_SETTINGS = [
    'nodePath'
]

NODE_PATH = "node"

class RefactorBaseClass(sublime_plugin.TextCommand):
    currentCursorPosition = -1

    def init(self, edit, active_group=False):
        '''Restores user settings.'''
        settings = sublime.load_settings('Refactor.sublime-settings')
        
        for setting in ALL_SETTINGS:
            if settings.get(setting) != None:
                self.view.settings().set(setting, settings.get(setting))

        NODE_PATH = self.view.settings().get('nodePath', 'node') 
        print((__name__ + '.sublime-settings'))
        print(NODE_PATH)

    def save(self):
        self.view.run_command("save")

    def executeNodeJsShell(self, cmd):
        out = ""
        err = ""
        result = ""
        if (platform.system() is "Windows"):
            newCmd = cmd
        else:
            newCmd = " ".join("'" + str(x) + "'" for x in cmd)

        p = subprocess.Popen(newCmd, shell=True, stdout=subprocess.PIPE,  stderr=subprocess.PIPE)
        (out, err) = p.communicate()
        if err.decode('utf-8') != '':
            sublime.error_message(str(err))
        else:
            result = out
        return result.decode('utf-8')

    def applyMultipleSelections(self, selections):
        for region in selections:
            r = sublime.Region(self.currentCursorPosition + region[0], self.currentCursorPosition + region[1])
            self.view.sel().add(r)

    def abortMultiselection(self):
        if len(self.view.sel()) != 1:
            sublime.error_message("Multiple selection is not supported.")
            return True
        else:
            return False

    def openJSONFile(self, filename):
        json_file = open(filename)
        data = json.load(json_file)
        json_file.close()
        return data

    def writeTextFile(self, data, filename):
        text_file = open(filename, "w")
        text_file.write(data)
        text_file.close()

    def replaceCurrentTextSelection(self, edit, text):
        startPos = 0
        for region in self.view.sel():
            startPos = region.a
            if region.b < startPos:
                startPos = region.b
            self.view.replace(edit, region, text)
            self.currentCursorPosition = startPos
        return startPos

    def normalize_line_endings(self, string):
        string = string.replace('\r\n', '\n').replace('\r', '\n')
        line_endings = self.view.settings().get('default_line_ending')
        if line_endings == 'windows':
            string = string.replace('\n', '\r\n')
        elif line_endings == 'mac':
            string = string.replace('\n', '\r')
        return string

    def get_indent(self, pos):
        (row, col) = self.view.rowcol(pos)
        indent_region = self.view.find('^\s+', self.view.text_point(row, 0))
        if self.view.rowcol(indent_region.begin())[0] == row:
            indent = self.view.substr(indent_region)
        else:
            indent = ''
        return indent


class ExtractmethodCommand(RefactorBaseClass):
    def run(self, edit):
        self.init(edit)
        self.ExtractmethodCommand(edit)

    def ExtractmethodCommand(self, edit):
        if self.abortMultiselection():
            return

        scriptPath = REFACTOR_PLUGIN_FOLDER + "js/run.js"
        tempFile = tempfile.gettempdir() + "/tmp.txt.js"
        jsonResultTempFile = tempfile.gettempdir() + "/resultCodePositions.json"
        settings = ' '.join([
            "indent_size:\ 2",
            "indent_char:\ ' '",
            "max_char:\ 80",
            "brace_style:\ collapse"
        ])

        cmd = [self.view.settings().get('nodePath', 'node'), scriptPath, tempFile, jsonResultTempFile, settings]
        code = self.view.substr(self.view.sel()[0])
        self.writeTextFile(code, tempFile)
        refactoredText = self.executeNodeJsShell(cmd)

        if len(refactoredText):
            pos = self.view.sel()[0].begin()
            indend = self.get_indent(pos)
            self.replaceCurrentTextSelection(edit, refactoredText.replace("\n", "\n" + indend))
            selections = [[12, 13]]  # self.openJSONFile(jsonResultTempFile)
            self.view.sel().clear()
            self.applyMultipleSelections(selections)
            self.view.run_command("renamevariable", {})
        os.remove(tempFile)


class GotodefinitionCommand(RefactorBaseClass):
    def run(self, edit):
        self.init(edit)
        self.save()
        self.GotodefinitionCommand(edit)

    def GotodefinitionCommand(self, edit):
        if self.abortMultiselection():
            return

        pos = self.view.sel()[0].begin()
        scriptPath = REFACTOR_PLUGIN_FOLDER + "js/run-goto-definition.js"
        cmd = [self.view.settings().get('nodePath', 'node'), scriptPath, self.view.file_name(), str(pos)]
        codePositionString = self.executeNodeJsShell(cmd)
        codePosition = json.loads(codePositionString, encoding="utf-8")
        if codePosition != -1:
            self.view.run_command("goto_line", {"line": codePosition["line"]})
            r = sublime.Region(codePosition["begin"], codePosition["end"])
            self.view.sel().clear()
            self.view.sel().add(r)
        else:
            sublime.status_message("Could not find declaration of " + self.view.substr(self.view.word(pos)))


class RenamevariableCommand(RefactorBaseClass):
    def run(self, edit):
        self.init(edit)
        self.save()
        self.RenamevariableCommand(edit)

    def RenamevariableCommand(self, edit):
        if self.abortMultiselection():
            return

        pos = self.view.sel()[0].begin()
        scriptPath = REFACTOR_PLUGIN_FOLDER + "js/run-rename-variable.js"
        jsonResultTempFile = tempfile.gettempdir() + "/resultCodePositions.json"
        cmd = [self.view.settings().get('nodePath', 'node'), scriptPath, self.view.file_name(), str(pos), jsonResultTempFile]
        self.executeNodeJsShell(cmd)
        self.view.sel().clear()
        if (os.path.exists(jsonResultTempFile)):
            selections = self.openJSONFile(jsonResultTempFile)
            self.applyMultipleSelections(selections)
            os.remove(jsonResultTempFile)
        else:
            sublime.status_message("Could not find declaration of " + self.view.substr(self.view.word(pos)))


class IntroducevariableCommand(RefactorBaseClass):
    def run(self, edit):
        self.init(edit)
        self.Introducevariable(edit)

    def Introducevariable(self, edit):
        if self.abortMultiselection():
            return

        pos = self.view.sel()[0].begin()
        line = self.view.line(pos)
        indend = self.get_indent(pos)
        code = self.view.substr(self.view.sel()[0])
        newVariableName = "__newVar__" + str(datetime.now()).replace(" ", "").replace(":", "").replace("-", "").replace(".", "")
        self.replaceCurrentTextSelection(edit, newVariableName)
        newPos = len(indend) + line.begin()
        self.view.insert(edit, line.begin(), indend + "var " + newVariableName + " = " + code + ";\n")
        r = sublime.Region(newPos + 4, newPos + len(newVariableName) + 4)
        self.view.sel().clear()
        self.view.sel().add(r)
        self.view.run_command("renamevariable", {})
