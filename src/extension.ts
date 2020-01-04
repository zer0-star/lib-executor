import * as vscode from "vscode";
import { isUndefined, isNull } from "util";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "lib-executer" is now active!');
  const config = vscode.workspace.getConfiguration("lib-executor");
  const languageConfig = JSON.parse(
    fs.readFileSync(
      config.get("libraryPath") +
        "languageconfig.json",
      "utf8"
    )
  );

  let disposable = vscode.commands.registerCommand(
    "lib-executor.execute",
    async () => {
      let quickPick = vscode.window.createQuickPick();
      quickPick.canSelectMany = false;

      let filetype = vscode.window.activeTextEditor?.document?.languageId;

      if (isUndefined(filetype)) {
        vscode.window.showErrorMessage("Error: undefined filetype");
        return;
      }

      async function getItems(
        base: string,
        lib: string,
        libF: string
      ): Promise<vscode.QuickPickItem[]> {
        // console.log(base + lib);
        // console.log(libF);
        let result = (
          await vscode.workspace.fs.readDirectory(vscode.Uri.file(base + lib))
        )
          .map(v => (v[1] === vscode.FileType.Directory ? v[0] + "/" : v[0]))
          // .filter(v => RegExp("^" + libF).test(v))
          .map(v => ({ label: lib + v }));
        return result;
      }
      let baseUri =
        config.get("libraryPath") +
        filetype +
        "/";
      let libUri = "";
      let libUriFile = "";
      const commentStr: string = languageConfig[filetype]["comment"];

      quickPick.items = await getItems(baseUri, libUri, libUriFile);
      quickPick.onDidChangeValue(async e => {
        let match = /(.*\/)?([^/]*)/.exec(e);
        if (isNull(match)) {
          return;
        }
        [, libUri, libUriFile] = match;
        if (isUndefined(libUri)) {
          libUri = "";
        }
        quickPick.items = await getItems(baseUri, libUri, libUriFile);
      });

      function execCmd(str: string, pwd: string): string {
        let i = 0;
        let result = "";
        const line = str.split("\n");
        const len = line.length;
        function chooseCmd(cmd: string, arg: string[]) {
          switch (cmd) {
            case "replace":
              cmdReplace(arg);
              break;
            case "include":
              cmdInclude(arg);
              break;
            default:
              break;
          }
        }
        function cmdReplace(arg: string[]) {
          const path = arg[0];
          result += getFile(pwd, path) + "\n";
          while (true) {
            try {
              let str = line[++i];
            } catch (error) {
              vscode.window.showErrorMessage(error.toString());
            }
            const match = /.{0,5}%lib-executor: *(.+)/.exec(line[i]);
            if (!isNull(match)) {
              const [cmd, ...arg] = match[1].split(" ");
              if (cmd === "end") {
                break;
              } else {
                // chooseCmd(cmd, arg);
              }
            }
          }
        }
        function cmdInclude(arg: string[]) {
          const path = arg[0];
          result += getFile(pwd, path) + "\n";
        }
        while (i < len) {
          const match = /.{0,5}%lib-executor: *(.+)/.exec(line[i]);
          if (isNull(match)) {
            result += line[i] + "\n";
          } else {
            const [cmd, ...arg] = match[1].split(" ");
            chooseCmd(cmd, arg);
          }
          i++;
        }
        return result;
      }

      function getFile(base: string, path: string): string {
        let result = "";
        const match = /(.*\/)[^/]*/.exec(base + path);
        if (isNull(match)) {
          throw 0;
        }
        const str = fs.readFileSync(base + path, "utf8");
        result += commentStr + "========= " + path + " ========= {{{\n\n";
        result += execCmd(str, base);
        result += commentStr + "========= " + path + " ========= }}}\n\n";
        return result;
      }

      quickPick.onDidAccept(async () => {
        let val = quickPick.selectedItems[0].label;
        if (val[val.length - 1] === "/") {
          libUri = val;
          libUriFile = "";
          quickPick.value = val;
          quickPick.items = await getItems(baseUri, libUri, libUriFile);
        } else {
          const editor = vscode.window.activeTextEditor;
          if (isUndefined(editor)) {
            vscode.window.showErrorMessage("Error: Empty text editor");
            return;
          }
          let pos: vscode.Position;
          if (editor.selection.isEmpty) {
            pos = editor.selection.active;
          } else {
            vscode.window.showErrorMessage("Error: Selection must be empty");
            return;
          }
          let edit = new vscode.WorkspaceEdit();
          const str = getFile(baseUri, val);
          edit.insert(editor.document.uri, pos, str);
          await vscode.workspace.applyEdit(edit);
          quickPick.hide();
        }
      });
      // quickPick.buttons = items.map(value => {
      //   return {
      //     iconPath: value[1] === vscode.FileType.Directory ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File
      //   };
      // });
      quickPick.show();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
