import * as vscode from 'vscode';

function logMsg(channel: vscode.OutputChannel, conf: any, msg: string) {
  if (conf.get('debug')) {
    channel.appendLine(msg);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const conf: any = vscode.workspace.getConfiguration('godot-tabs-formatter');
  const channel = vscode.window.createOutputChannel('Godot Tabs Formatter');

  logMsg(channel, conf, 'Godot Tabs Formatter activated');
  
  context.globalState.get('firstActivation', true);
  if (context.globalState.get('firstActivation', true)) {
    vscode.window.showInformationMessage(
      'Godot Tabs Formatter activated. GDScript files will now automatically use tabs for indentation on save.'
    );
    context.globalState.update('firstActivation', false);
  }

  const saveListener = vscode.workspace.onWillSaveTextDocument((e) => {
    if (e.document.languageId !== 'gdscript' && !e.document.fileName.endsWith('.gd')) {
      return;
    }

    if (!conf.get('enabled')) {
      logMsg(channel, conf, 'Extension is disabled, skipping formatting');
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document !== e.document) {
      logMsg(channel, conf, 'No active editor for this document');
      return;
    }

    const tabSize = Number(vscode.workspace.getConfiguration('',
      { languageId: e.document.languageId }).get('editor.tabSize')) || 4;
    logMsg(channel, conf, 'Tab size: ' + tabSize);

    const firstLine = e.document.lineAt(0);
    const lastLine = e.document.lineAt(e.document.lineCount - 1);
    const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
    
    const currentSelection = editor.selection;
    const currentPosition = currentSelection.active;
    
    let spacesToTabsAdjustment = 0;
    
    const processedLines: string[] = [];
    
    for (let i = 0; i < e.document.lineCount; i++) {
      const line = e.document.lineAt(i);
      const lineText = line.text;
      
      const leadingSpacesMatch = lineText.match(/^( +)/);
      
      if (!leadingSpacesMatch) {
        processedLines.push(lineText);
        continue;
      }
      
      const leadingSpaces = leadingSpacesMatch[0];
      const spacesCount = leadingSpaces.length;
      
      if (spacesCount < tabSize) {
        processedLines.push(lineText);
        continue;
      }
      
      const tabCount = Math.floor(spacesCount / tabSize);
      const remainingSpaces = spacesCount % tabSize;
      
      const newIndentation = '\t'.repeat(tabCount) + ' '.repeat(remainingSpaces);
      
      const newLineText = lineText.replace(/^( +)/, newIndentation);
      processedLines.push(newLineText);
      
      if (i === currentPosition.line) {
        const cursorCol = currentPosition.character;
        
        if (cursorCol > spacesCount) {
          spacesToTabsAdjustment = tabCount - spacesCount;
        } 
        else if (cursorCol > 0) {
          const tabsBeforeCursor = Math.floor(cursorCol / tabSize);
          spacesToTabsAdjustment = tabsBeforeCursor - cursorCol;
        }
        
        logMsg(channel, conf, `Cursor adjustment: ${spacesToTabsAdjustment}`);
      }
    }
    
    const eol = e.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
    const newContent = processedLines.join(eol);
    
    e.waitUntil(Promise.resolve([new vscode.TextEdit(fullRange, newContent)]));
    
    if (spacesToTabsAdjustment !== 0) {
      setImmediate(() => {
        const newPosition = currentPosition.with(
          currentPosition.line, 
          Math.max(0, currentPosition.character + spacesToTabsAdjustment)
        );
        
        let newSelection: vscode.Selection;
        
        if (currentSelection.isEmpty) {
          newSelection = new vscode.Selection(newPosition, newPosition);
        } else {
          let start = currentSelection.start;
          let end = currentSelection.end;
          
          if (start.line === currentPosition.line) {
            start = start.with(start.line, Math.max(0, start.character + spacesToTabsAdjustment));
          }
          
          if (end.line === currentPosition.line) {
            end = end.with(end.line, Math.max(0, end.character + spacesToTabsAdjustment));
          }
          
          newSelection = new vscode.Selection(start, end);
        }
        
        if (editor.document === e.document) {
          editor.selection = newSelection;
        }
      });
    }
  });
  
  const configListener = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('godot-tabs-formatter')) {
      const newConf = vscode.workspace.getConfiguration('godot-tabs-formatter');
      logMsg(channel, newConf, 'Configuration changed');
    }
  });
  
  context.subscriptions.push(
    saveListener,
    configListener,
    vscode.commands.registerCommand('godot-tabs-formatter.enable', () => {
      conf.update('enabled', true, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Godot Tabs Formatter enabled');
    }),
    vscode.commands.registerCommand('godot-tabs-formatter.disable', () => {
      conf.update('enabled', false, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Godot Tabs Formatter disabled');
    })
  );
}

export function deactivate() {
}