// Import necessary modules
const vscode = require('vscode');
const axios = require('axios');

// Function to interact with AI for code conversion, hints, and solutions
async function getAIResponse(prompt) {
    try {
        const response = await axios.post('https://api.example.com/ai', { prompt });
        return response.data;
    } catch (error) {
        vscode.window.showErrorMessage('AI response failed');
        return null;
    }
}

// Command to convert code
async function convertCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const code = editor.document.getText();
    const language = await vscode.window.showQuickPick(['Python', 'JavaScript', 'Java', 'C++'], { placeHolder: 'Select target language' });
    if (!language) return;

    const convertedCode = await getAIResponse(`Convert this code to ${language}: ${code}`);
    if (convertedCode) {
        const filePath = editor.document.uri.fsPath.replace(/\.[^.]+$/, `.${language.toLowerCase()}`);
        vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(convertedCode));
        vscode.window.showInformationMessage('Code converted and saved.');
    }
}

// Command to provide hints and solutions
async function provideAssistance() {
    const problem = await vscode.window.showInputBox({ prompt: 'Enter your problem statement' });
    if (!problem) return;
    
    const hint = await getAIResponse(`Provide a hint for: ${problem}`);
    const solution = await getAIResponse(`Provide a solution for: ${problem}`);
    if (hint && solution) {
        vscode.window.showInformationMessage(`Hint: ${hint}`);
        vscode.workspace.fs.writeFile(vscode.Uri.file('solution.txt'), Buffer.from(solution));
    }
}

// Command to optimize code
async function optimizeCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const code = editor.document.getText();
    const optimizedCode = await getAIResponse(`Optimize this code: ${code}`);
    if (optimizedCode) {
        editor.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), optimizedCode);
        });
        vscode.window.showInformationMessage('Code optimized successfully.');
    }
}

// Function to provide feedback while coding
function setupCodeFeedback(context) {
    vscode.workspace.onDidChangeTextDocument(event => {
        const lastLine = event.document.lineAt(event.document.lineCount - 1).text;
        if (lastLine.includes('error')) {
            vscode.window.showWarningMessage('Please check again!');
        } else if (lastLine.trim().length > 0) {
            vscode.window.showInformationMessage('Good, keep it up!');
        }
    });
}

// Extension activation
function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.convertCode', convertCode),
        vscode.commands.registerCommand('extension.provideAssistance', provideAssistance),
        vscode.commands.registerCommand('extension.optimizeCode', optimizeCode)
    );
    setupCodeFeedback(context);
    vscode.window.showInformationMessage('AI Code Assistant Extension Activated');
}

// Deactivation function
function deactivate() {}

module.exports = { activate, deactivate };
