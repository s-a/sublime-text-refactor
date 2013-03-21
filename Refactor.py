import commands
import subprocess
import sublime
import sublime_plugin


class RefactorCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        self.save()
        self.RefactorCommand(edit)

    def save(self):
        self.view.run_command("save")

    def RefactorCommand(self, edit):
        scriptPath = sublime.packages_path() + "/Refactor/js/run.js"
        settings = ' '.join([
            "indent_size:\ 2",
            "indent_char:\ ' '",
            "max_char:\ 80",
            "brace_style:\ collapse"
        ])
        tempFile = sublime.packages_path() + "/Refactor/tmp.txt.js"
        #self.view.file_name()
        cmd = ["node", scriptPath, tempFile, settings]
        if len(self.view.sel())!=1:
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

        print refactoredText
        if len(refactoredText) and err == "" > 0:
            for region in self.view.sel():
                self.view.replace(edit, region, refactoredText.decode('utf-8'))
            #self.view.replace(edit, sublime.Region(0, self.view.size()), )
            #self.view.replace(edit, sublime.Region(self.view.sel()), )
            sublime.set_timeout(self.save, 100)
