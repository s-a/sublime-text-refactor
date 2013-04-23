import commands
import subprocess
import sublime
import sublime_plugin
import os
import os.path
import json
from os.path import dirname, realpath


REFACTOR_PLUGIN_FOLDER = dirname(realpath(__file__)) + "/"


class RefactorBaseClass(sublime_plugin.TextCommand):
    currentCursorPosition = -1

    def save(self):
        self.view.run_command("save")

    def executeNodeJsShell(self, cmd):
        out = ""
        err = ""
        result = ""
        if sublime.platform() == 'windows':
            p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE,  stderr=subprocess.PIPE)
            (out, err) = p.communicate()

            if err != '':
                sublime.error_message(err)
            else:
                result = out
        else:
            # fixme: fetch error messages
            result = commands.getoutput('"'+'" "'.join(cmd)+'"')
        return result

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
            self.view.replace(edit, region, text.decode('utf-8'))
            self.currentCursorPosition = startPos
        return startPos


class ExtractmethodCommand(RefactorBaseClass):
    def run(self, edit):
        self.ExtractmethodCommand(edit)

    def ExtractmethodCommand(self, edit):
        if self.abortMultiselection():
            return

        scriptPath = REFACTOR_PLUGIN_FOLDER + "js/run.js"
        tempFile = REFACTOR_PLUGIN_FOLDER + "tmp.txt.js"
        jsonResultTempFile = REFACTOR_PLUGIN_FOLDER + "resultCodePositions.json"
        settings = ' '.join([
            "indent_size:\ 2",
            "indent_char:\ ' '",
            "max_char:\ 80",
            "brace_style:\ collapse"
        ])

        cmd = ["node", scriptPath, tempFile, settings]
        code = self.view.substr(self.view.sel()[0])
        self.writeTextFile(code, tempFile)
        refactoredText = self.executeNodeJsShell(cmd)

        if len(refactoredText):
            self.replaceCurrentTextSelection(edit, refactoredText)

            self.view.sel().clear()
            selections = self.openJSONFile(jsonResultTempFile)
            self.applyMultipleSelections(selections)

            os.remove(jsonResultTempFile)
        os.remove(tempFile)


class GotodefinitionCommand(RefactorBaseClass):
    def run(self, edit):
        self.save()
        self.GotodefinitionCommand(edit)

    def GotodefinitionCommand(self, edit):
        if self.abortMultiselection():
            return

        pos = self.view.sel()[0].begin()
        scriptPath = REFACTOR_PLUGIN_FOLDER + "js/run-goto-definition.js"
        cmd = ["node", scriptPath, self.view.file_name(), str(pos)]
        codePositionString = self.executeNodeJsShell(cmd)
        codePosition = json.loads(codePositionString, encoding="utf-8")
        if codePosition != -1:
            self.view.run_command("goto_line", {"line": codePosition["line"]})
            r = sublime.Region(codePosition["begin"], codePosition["end"])
            self.view.sel().clear()
            self.view.sel().add(r)


class RenamevariableCommand(RefactorBaseClass):
    def run(self, edit):
        self.save()
        self.RenamevariableCommand(edit)

    def RenamevariableCommand(self, edit):
        if self.abortMultiselection():
            return

        pos = self.view.sel()[0].begin()
        scriptPath = REFACTOR_PLUGIN_FOLDER + "js/run-rename-variable.js"
        cmd = ["node", scriptPath, self.view.file_name(), str(pos)]
        self.executeNodeJsShell(cmd)
        self.view.sel().clear()
        jsonResultTempFile = REFACTOR_PLUGIN_FOLDER + "resultCodePositions.json"
        selections = self.openJSONFile(jsonResultTempFile)
        self.applyMultipleSelections(selections)

        os.remove(jsonResultTempFile)
