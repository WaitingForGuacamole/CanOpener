// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('open-containing: Activated.');

	let containingCommand = vscode.commands.registerTextEditorCommand('can-opener.open-containing', 
		(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any) => {
			if (args.fsPath && args.scheme !== "untitled") {
				openContainingFolder(args.fsPath);
			} else {
				vscode.window.showInformationMessage('Can Opener: editor has not been saved.');
			}
		}
	);

	let topMostCommand = vscode.commands.registerTextEditorCommand('can-opener.open-topmost', 
		(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any) => {
			if (args.fsPath && args.scheme !== "untitled") {
				openTopmostFolder(args.fsPath);	
			} else {
				vscode.window.showInformationMessage('Can Opener: editor has not been saved.');
			}
		}
	);

	let gitRepoCommand = vscode.commands.registerTextEditorCommand("can-opener.open-repo",
		(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any) => {
			if (args.fsPath && args.scheme !== "untitled") {
				openGitRepo(args.fsPath);
			} else {
				vscode.window.showInformationMessage('Can Opener: editor has not been saved.');
			}
		}
	);

	context.subscriptions.push(containingCommand);
	context.subscriptions.push(topMostCommand);
	context.subscriptions.push(gitRepoCommand);

	function getRootFolder(fromPath: string): string {
		return fromPath.split(path.sep).slice(0, 1) + path.sep;
	}

	function getTopFolder(fromPath: string): string {
      return fromPath.split(path.sep).slice(0, 2).join(path.sep);
    }

	function getParentFolder(fromPath: string): string {
		if (!fromPath || fromPath === getRootFolder(fromPath)) {
			return null!;
		}

		return path.resolve(fromPath, "..");
	}

	function getGitRepo(fromDirectory?: string): string {
		const hasDir = (p:string, n:string) =>
		fs
			.readdirSync(p)
			.filter((f: string) => f === n && fs.statSync(path.join(p, f)).isDirectory())
			.length > 0;

		if (fromDirectory && hasDir(fromDirectory, ".git")) {
			return fromDirectory;
		} else if (fromDirectory) {
			return getGitRepo(getParentFolder(fromDirectory));
		} else {
			return null!;
		}
	}
	
	function openFolder(folder: string) {
		console.log("open-containing: Opening workspace folder "  + folder);
		let folderUri = vscode.Uri.file(folder);
    	let success = vscode.commands.executeCommand("vscode.openFolder", folderUri);
	}

	function openContainingFolder(editorPath: string) {
		let activeFolder = path.dirname(editorPath);
		openFolder(activeFolder);
	}

	function openTopmostFolder(editorPath: string) {
		let activeFolder = path.dirname(editorPath);
		let topFolder = getTopFolder(activeFolder);

		if (topFolder) {
			openFolder(topFolder);
		}
	}

	function openGitRepo(editorPath: string) {
		let activeFolder = path.dirname(editorPath);
		let repoFolder = getGitRepo(activeFolder);

		if (repoFolder) {
			openFolder(repoFolder);
		} else {
			vscode.window.showInformationMessage(activeFolder + " is not in a Git repository.");
		}
	}

}

// this method is called when your extension is deactivated
export function deactivate() {}
