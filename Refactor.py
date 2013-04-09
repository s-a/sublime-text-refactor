import commands
import subprocess
import sublime
import sublime_plugin
import os
import os.path
import json
from os.path import dirname, realpath


REFACTOR_PLUGIN_FOLDER = dirname(realpath(__file__)) + "/"


class RefactorCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        self.save()
        self.RefactorCommand(edit)

    def save(self):
        self.view.run_command("save")

    def RefactorCommand(self, edit):
        scriptPath = REFACTOR_PLUGIN_FOLDER + "js/run.js"
        settings = ' '.join([
            "indent_size:\ 2",
            "indent_char:\ ' '",
            "max_char:\ 80",
            "brace_style:\ collapse"
        ])
        tempFile = REFACTOR_PLUGIN_FOLDER + "tmp.txt.js"
        jsonResultTempFile = REFACTOR_PLUGIN_FOLDER + "resultCodePositions.json"
        #self.view.file_name()
        cmd = ["node", scriptPath, tempFile, settings]
        if len(self.view.sel()) != 1:
            sublime.error_message("Multiple selection is not supported.")
        out = ""
        err = ""
        refactoredText = ""
        code = self.view.substr(self.view.sel()[0])
        text_file = open(tempFile, "w")
        text_file.write(code)
        text_file.close()
        if sublime.platform() == 'windows':
            p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE,  stderr=subprocess.PIPE)
            (out, err) = p.communicate()

            if err != '':
                sublime.error_message(err)
            else:
                refactoredText = out
        else:
            # fixme: fetch error messages
            refactoredText = commands.getoutput('"'+'" "'.join(cmd)+'"')

        if len(refactoredText) and err == "" > 0:
            startPos = 0
            for region in self.view.sel():
                startPos = region.a
                if region.b < startPos:
                    startPos = region.b
                self.view.replace(edit, region, refactoredText.decode('utf-8'))
            #print startPos
            sublime.set_timeout(self.save, 100)
            self.view.sel().clear()

            json_file = open(jsonResultTempFile)
            data = json.load(json_file)
            json_file.close()

            for region in data:
                #print region[0]
                #print region[1]

                r = sublime.Region(startPos+region[0], startPos+region[1])
                self.view.sel().add(r)

            os.remove(jsonResultTempFile)
        os.remove(tempFile)
