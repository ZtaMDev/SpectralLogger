import * as vscode from "vscode";

interface SpectralColors {
  info: string;
  success: string;
  warn: string;
  error: string;
  log: string;
  debug: string;
}

interface SpectralConfig {
  showTimestamp: boolean;
  showLevel: boolean;
  debugMode: boolean;
  bufferWrites?: boolean;
  asyncStacks?: boolean;
  colors: SpectralColors;
}

export function activate(context: vscode.ExtensionContext) {
  // --- Completion provider para spec:config ---
  const provider = vscode.languages.registerCompletionItemProvider(
    { language: "javascript", scheme: "file" },
    {
      provideCompletionItems(document, position) {
        const line = document.lineAt(position).text;
        if (!line.includes("spec:config")) return [];

        const item = new vscode.CompletionItem(
          "Insert SpectralLogs configuration",
          vscode.CompletionItemKind.Snippet
        );
        item.detail = "Create a SpectralLogs configuration interactively";
        item.insertText = "";
        item.command = {
          title: "Insert SpectralLogs configuration",
          command: "spectrallogs.insertConfigInteractive",
        };
        return [item];
      },
    },
    ":"
  );

  // --- Comando de inserción de configuración ---
  const cmd = vscode.commands.registerCommand(
    "spectrallogs.insertConfigInteractive",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const doc = editor.document;
      const text = doc.getText();

      // Detect existing config variable
      let configName = "config";
      if (/\bconst\s+config\b/.test(text)) {
        const choice = await vscode.window.showQuickPick(
          ["Replace existing config", "Create new variable"],
          { placeHolder: "A config variable already exists" }
        );
        if (!choice) return;
        if (choice === "Create new variable") {
          const nameInput = await vscode.window.showInputBox({
            prompt: "Enter a new variable name",
            value: "config2",
          });
          if (!nameInput) return;
          configName = nameInput;
        }
      }

      const booleanOptions: [keyof SpectralConfig, string][] = [
        ["showTimestamp", "Show timestamp?"],
        ["showLevel", "Show log level?"],
        ["debugMode", "Enable debug mode?"],
        ["bufferWrites", "Enable bufferWrites?"],
        ["asyncStacks", "Enable asyncStacks?"],
      ];

      const config: SpectralConfig = {
        showTimestamp: false,
        showLevel: false,
        debugMode: false,
        colors: {
          info: "#00bfff",
          success: "#00ff88",
          warn: "#ffaa00",
          error: "#ff5555",
          log: "#dddddd",
          debug: "#cc66ff",
        },
      };

      for (const [key, prompt] of booleanOptions) {
        if (
          (key === "bufferWrites" || key === "asyncStacks") &&
          text.includes("spectrallogs/web")
        ) {
          continue;
        }
        const value = await vscode.window.showQuickPick(["true", "false"], {
          placeHolder: prompt,
        });
        if (!value) return;
        (config[key as keyof SpectralConfig] as boolean) = value === "true";
      }

      const colorKeys: (keyof SpectralColors)[] = [
        "info",
        "success",
        "warn",
        "error",
        "log",
        "debug",
      ];
      for (const key of colorKeys) {
        const value = await vscode.window.showInputBox({
          prompt: `Color for '${key}'`,
          value: config.colors[key],
        });
        if (!value) return;
        config.colors[key] = value;
      }

      const snippet = `const ${configName} = ${JSON.stringify(
        config,
        null,
        2
      )};\n`;

      const importEnd = findLastImportLine(doc);
      const position = new vscode.Position(importEnd + 1, 0);

      await editor.edit((editBuilder) => {
        editBuilder.insert(position, snippet);
      });
    }
  );

  context.subscriptions.push(provider, cmd);

  // === AUTO-DETECTION OF SPECTRAL LOGS ===
  async function detectSpectralUsage(doc: vscode.TextDocument) {
    if (!doc || !doc.getText) return;
    const text = doc.getText();

    const found =
      /\bimport\s+.*["']spectrallogs["']/.test(text) ||
      /\brequire\(["']spectrallogs["']\)/.test(text) ||
      /\bspec\s*\./.test(text); // detecta uso de spec directamente

    if (found) {
      const alreadyShown = context.workspaceState.get<boolean>(
        "spectralLogsNotified"
      );
      if (alreadyShown) return;

      const choice = await vscode.window.showInformationMessage(
        "Spectral Logs usage detected! Would you like to open the Playground?",
        "Open Playground",
        "Ignore"
      );

      if (choice === "Open Playground") {
        vscode.commands.executeCommand("spectrallogs.openPlayground");
      }

      context.workspaceState.update("spectralLogsNotified", true);
    }
  }

  vscode.workspace.onDidOpenTextDocument(detectSpectralUsage);
  if (vscode.window.activeTextEditor) {
    detectSpectralUsage(vscode.window.activeTextEditor.document);
  }

  // arriba en activate(): declara una variable que persiste el panel
  let playgroundPanel: vscode.WebviewPanel | undefined;

  // comando para abrir playground (modifica el que ya tienes)
  const playgroundCmd = vscode.commands.registerCommand(
    "spectrallogs.openPlayground",
    () => {
      if (playgroundPanel) {
        playgroundPanel.reveal(vscode.ViewColumn.Active);
        return;
      }

      playgroundPanel = vscode.window.createWebviewPanel(
        "spectralLogsPlayground",
        "Spectral Logs Playground",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );
      playgroundPanel.iconPath = vscode.Uri.file(
      context.asAbsolutePath("media/logo.png") // ruta de tu ícono dentro de tu extensión
      );

      const htmlFilePath = vscode.Uri.file(
        context.asAbsolutePath("media/playground.html")
      );
      vscode.workspace.fs.readFile(htmlFilePath).then((data) => {
        if (!playgroundPanel) return;
        playgroundPanel.webview.html = data.toString();
      });

      // handle messages FROM webview if needed
      playgroundPanel.webview.onDidReceiveMessage((msg) => {
        // we purposely avoid noisy notifications; but you can handle events if you want
        if (msg.command === "clearedFromWebview") {
          // optional: log to output channel or update state; we do nothing to avoid notifications
        }
      });

      // cleanup when closed
      playgroundPanel.onDidDispose(() => {
        playgroundPanel = undefined;
      });
    }
  );
  context.subscriptions.push(playgroundCmd);

  // --- NEW: command to clear the playground from VS Code ---
  const clearCmd = vscode.commands.registerCommand("spectrallogs.clearPlayground", () => {
    if (playgroundPanel) {
      playgroundPanel.webview.postMessage({ command: "clear" });
    } else {
      // do nothing (no noisy notifications)
    }
  });
  context.subscriptions.push(clearCmd);

}

// --- Helper ---
function findLastImportLine(document: vscode.TextDocument): number {
  for (let i = document.lineCount - 1; i >= 0; i--) {
    const line = document.lineAt(i).text.trim();
    if (
      line.startsWith("import") ||
      line.match(/^const\s+\w+\s*=\s*require\(/)
    ) {
      return i;
    }
  }
  return 0;
}
