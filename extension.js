// //----------------------------------------------------------------
// //                     DEPENDENCIES
// //----------------------------------------------------------------
// const vscode = require('vscode');
// const fs = require('fs');
// const path = require('path');
// const { OpenAI } = require("openai");
// const { exec } = require('child_process');

// //----------------------------------------------------------------
// //                  GLOBAL VARIABLES
// //----------------------------------------------------------------
// const openai = new OpenAI({ apiKey: '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' });
// const test_cases = 3;
// let language = "";
// let edgecases_used = "";
// let extra_test_case_count = 0;
// let loadingIndicator; // Declare loadingIndicator variable here

// //----------------------------------------------------------------
// //                  FORMAT THE CODE
// //----------------------------------------------------------------

// // PYTHON
// async function formatGeneratedCode(generatedCode) {
//     generatedCode = generatedCode.replace(/`/g, '');
//     generatedCode = generatedCode.replace(/^```python/, '').replace(/```$/, '');
//     generatedCode = generatedCode.replace(/^python\s*/, '');
//     return generatedCode;
// }

// // JAVASCRIPT
// async function formatGeneratedCodeJS(generatedCode) {
//     generatedCode = generatedCode.replace(/`/g, '');
//     generatedCode = generatedCode.replace(/^```javascript/, '').replace(/```$/, '');
//     generatedCode = generatedCode.replace(/^javascript\s*/, '');
//     generatedCode = generatedCode.trim();
//     return generatedCode;
// }

// // TYPESCRIPT
// async function formatGeneratedCodeTS(generatedCode) {
//     generatedCode = generatedCode.replace(/`/g, '');
//     generatedCode = generatedCode.replace(/^```typescript/, '').replace(/```$/, '');
//     generatedCode = generatedCode.replace(/^typescript\s*/, '');
//     generatedCode = generatedCode.trim();
//     return generatedCode;
// }

// // GOLANG
// async function formatGeneratedCodeGo(generatedCode) {
//     generatedCode = generatedCode.replace(/`/g, '');
//     generatedCode = generatedCode.replace(/^```go/, '').replace(/```$/, '');
//     generatedCode = generatedCode.replace(/^go\s*/, '');
//     generatedCode = generatedCode.trim();
//     return generatedCode;
// }

// //----------------------------------------------------------------
// //                 FIX TEST CODE
// //----------------------------------------------------------------
// async function fixtestcode(generatedCode, logs, language,directoryPath) {
//     try {
//         const model = "gpt-3.5-turbo"; // GPT-3.5 Turbo model
//         const prompt = `Return only and only fixed code, by analyzing the following ${language} code and \n\nGenerated Code:\n${generatedCode}\n\nLogs:\n${logs},Return only and only fixed code no test no reasons nothingjust fixed code`;
//         const response = await openai.chat.completions.create({
//             model: model,
//             messages: [{ role: "system", content: prompt }],
//             max_tokens: 900,
//             temperature: 0.7,
//             n: 1 
//         });

//         const fixedCode = response.choices[0].message.content.trim();
//         return fixedCode;
//     } catch (error) {
//         console.error('Error fixing test code:', error);
//         return 'Failed to fix test code. Please try again later.';
//     }
// }

// //----------------------------------------------------------------
// //                 FAILURE REASON
// //----------------------------------------------------------------
// async function analyzeFailureReasons(generatedCode, logs, language) {
//     try {
//         const model = "gpt-3.5-turbo"; 
//         const prompt = `Analyze the following ${language} code and logs to determine possible reasons for failure:\n\nGenerated Code:\n${generatedCode}\n\nLogs:\n${logs},Return ALL OK if no errors in logs otherwise return reason in English and not code`;
//         const response = await openai.chat.completions.create({
//             model: model,
//             messages: [{ role: "system", content: prompt }],
//             max_tokens: 100,
//             temperature: 0.7,
//             n: 1 
//         });

//         const failureReasons = response.choices[0].message.content.trim();
//         return failureReasons;
//     } catch (error) {
//         console.error('Error analyzing failure reasons:', error);
//         return 'Failed to analyze failure reasons. Please try again later.';
//     }
// }

// //----------------------------------------------------------------
// //                       FIX CODE
// //----------------------------------------------------------------
// async function fixCode(code, generatedCode, logs, reasons, language) {
//     try {
//         const model = "gpt-3.5-turbo"; 
//         const prompt = `You're tasked with fixing the provided ${language} code:

        
//         ${code}
        
//         The code, when tested with the following test cases:
        
//         \`\`\`
//         ${generatedCode}
//         \`\`\`
        
//         Encountered the following errors:
        
//         \`\`\`
//         ${logs}
//         \`\`\`
        
//         Based on the analysis, the reason for these errors is:
        
//         \`\`\`
//         ${reasons}
//         \`\`\`
        
//         Your task is to provide the fixed code, ensuring it's complete and functional. Please provide the fixed code without any comments or additional text, strictly adhering to the code structure. `;
        
//         const response = await openai.chat.completions.create({
//             model: model,
//             messages: [{ role: "system", content: prompt }],
//             max_tokens: 900,
//             temperature: 0.7,
//             n: 1 
//         });
        
//         const fixedCode = response.choices[0].message.content.trim();
//         return fixedCode;
//     } catch (error) {
//         console.error('Error fixing code:', error);
//         return 'Failed to fix code. Please try again later.';
//     }
// }


// //----------------------------------------------------------------
// //                    EDGE CASE AND ITS CODE
// //----------------------------------------------------------------
// async function generateEdgeCasesAndCode(code, directoryPath, language) {
//     const totalcases=test_cases+extra_test_case_count;
//     vscode.window.showInformationMessage(`Total Test Codes Asked are :${totalcases}.`);

//     try {
//         // EDGE CASES
//         const prompt = `Generate ${test_cases} test cases in plain English for the following code:\n\n${code}

//         Please provide the test cases using hyphens, for example:
//         - Test Case:Describe the first test case here.
//         - Test Case:Describe the second test case here.
//         - Test Case:Describe the third test case here.
//                 `;
//         const edgeCasesResponse = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [{ role: "system", content: prompt }],
//             temperature: 0.7,
//             max_tokens: 900
//         });
//         const edgeCases = edgeCasesResponse.choices[0].message.content.trim();

//         // EDGE CASES CODE+FORMATTING
//         const codePrompt = `
// Strict Prompt: Provide exactly ${totalcases}test cases code and  no less than ${totalcases} test cases codes.Provide only code, no reasons or explanations. Provide code for all given test cases below without missing any. So a total of ${totalcases} test cases code should be given. Ensure that the count of test cases code matches the expected number.

// Generate ${language} code suitable for unit testing. Ensure to include a main function for executing the code with the provided edge cases:

// \`\`\`
// ${edgeCases}

// ${edgecases_used}
// \`\`\`

// Assume that the original code is located in 'uwtest'. Include any necessary import statements if functions need to be imported.

// Please provide the code without any comments or additional text, strictly following the appropriate testing format. Ensure that the code includes a main function for execution and avoid adding trailing backticks.`;

        
//         const codeResponse = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [{ role: "system", content: codePrompt }],
//             temperature: 0.7,
//             max_tokens: 900
//         });
//         let generatedCode = codeResponse.choices[0].message.content.trim();

//         if (language === 'python') {
//             generatedCode = await formatGeneratedCode(generatedCode);
//         } else if (language === 'javascript') {
//             generatedCode = await formatGeneratedCodeJS(generatedCode);
//         } else if (language === 'typescript') {
//             generatedCode = await formatGeneratedCodeTS(generatedCode);
//         } else if (language === 'golang') {
//             generatedCode = await formatGeneratedCodeGo(generatedCode);
//         }

//         let newFileName;
//         if (language === 'python') {
//             newFileName = 'generated_test.py';
//         } else if (language === 'javascript') {
//             newFileName = 'generated_test.js';
//         } else if (language === 'typescript') {
//             newFileName = 'generated_test.ts';
//         } else if (language === 'golang') {
//             newFileName = 'generated_test.go';
//         }
//         const newFilePath = path.join(directoryPath, newFileName);
//         fs.writeFile(newFilePath, generatedCode, async (err) => {
//             if (err) {
//                 vscode.window.showErrorMessage(`Error writing file: ${err.message}`);
//                 return;
//             }
//             vscode.window.showInformationMessage(`File ${newFilePath} created successfully.`);
//             runCodeFile(code, edgeCases, generatedCode, newFilePath, language,directoryPath);
//         });

//     } catch (error) {
//         vscode.window.showErrorMessage('Error generating edge cases and code: ' + error.message);
//     }
// }


// //----------------------------------------------------------------
// //                      RUN CODE
// //----------------------------------------------------------------

// async function runCodeFile(code, edgeCases, generatedCode, filePath, language,directoryPath) {
//     try {
//         let command = '';
//         if (language === 'python') {
//             command = `python3 ${filePath}`;
//         } else if (language === 'javascript') {
//             command = `node ${filePath}`;
//         } else if (language === 'typescript') {
//             command = `ts-node ${filePath}`;
//         } else if (language === 'golang') {
//             command = `go run ${filePath}`;
//         } else {
//             throw new Error('Unsupported language');
//         }

//         exec(command, async (error, stdout, stderr) => {
//             let logs = '';
//             if (stdout) {
//                 logs += stdout.toString();
//             }
//             if (stderr) {
//                 logs += stderr.toString();
//             }

//             if (language === 'python') {
//                 const reasons = await analyzeFailureReasons(generatedCode, logs, language);
//                 const fix_test_code = await fixtestcode(generatedCode, logs, language,directoryPath);
//                 const fixed_test_code = await formatGeneratedCode(fix_test_code);
//                 const fixedCode = await fixCode(code, generatedCode, logs, reasons, language);
//                 const fixed_formatCode = await formatGeneratedCode(fixedCode);

//                 showResultsInWebView(edgeCases, generatedCode, logs, reasons, fixed_formatCode, fixed_test_code, filePath);
//                 loadingIndicator.hide(); 

//             } else if (language === 'javascript') {
//                 const reasons_j = await analyzeFailureReasons(generatedCode, logs, language);
//                 const fix_test_code = await fixtestcode(generatedCode, logs, language,directoryPath);
//                 const fixed_test_code = await formatGeneratedCodeJS(fix_test_code);
//                 const fixedCode_j = await fixCode(code, generatedCode, logs, reasons_j, language);
//                 const fixed_formatCode_j = await formatGeneratedCodeJS(fixedCode_j);

//                 showResultsInWebView(edgeCases, generatedCode, logs, reasons_j, fixed_formatCode_j, fixed_test_code, filePath);
//                 loadingIndicator.hide(); 

//             } else if (language === 'typescript') {
//                 const reasons_ts = await analyzeFailureReasons(generatedCode, logs, language);
//                 const fix_test_code = await fixtestcode(generatedCode, logs, language,directoryPath);
//                 const fixed_test_code = await formatGeneratedCodeTS(fix_test_code);
//                 const fixedCode_ts = await fixCode(code, generatedCode, logs, reasons_ts, language);
//                 const fixed_formatCode_ts = await formatGeneratedCodeTS(fixedCode_ts);

//                 showResultsInWebView(edgeCases, generatedCode, logs, reasons_ts, fixed_formatCode_ts, fixed_test_code, filePath);
//                 loadingIndicator.hide(); 

//             } else if (language === 'golang') {
//                 const reasons_go = await analyzeFailureReasons(generatedCode, logs, language);
//                 const fix_test_code = await fixtestcode(generatedCode, logs, language,directoryPath);
//                 const fixed_test_code = await formatGeneratedCodeGo(fix_test_code);
//                 const fixedCode_go = await fixCode(code, generatedCode, logs, reasons_go, language);
//                 const fixed_formatCode_go = await formatGeneratedCodeGo(fixedCode_go);

//                 showResultsInWebView(edgeCases, generatedCode, logs, reasons_go, fixed_formatCode_go, fixed_test_code, filePath);
//                 loadingIndicator.hide(); 

//             }
//         });
//     } catch (error) {
//         console.error('Error running code:', error);
//     }
// }

// function activate(context) {
//     let runButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
//     runButton.text = "$(triangle-right) Run Unitwise";
//     runButton.command = 'extension.swanaitesting';
//     runButton.tooltip = 'Run the extension';
//     runButton.show();

//     const terminal = vscode.window.createTerminal("Install Generative AI Dependency");

//     let disposable = vscode.commands.registerCommand('extension.swanaitesting', async () => {
//         loadingIndicator = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left); // Initialize loadingIndicator here
//         loadingIndicator.text = "$(sync~spin) Analyzing...";
//         loadingIndicator.show();
    
//         exec("npm list --depth 0 openai", (error, stdout, stderr) => {
//             if (stdout.includes('openai')) {
//                 vscode.window.showInformationMessage('Dependency already installed.');
//                 continueExtensionExecution();
//             } else {
//                 terminal.sendText("npm install --save openai");
//                 terminal.show();
    
//                 exec("npm install --save openai", (error, stdout, stderr) => {
//                     if (error || stderr) {
//                         vscode.window.showErrorMessage(`Failed to install dependency: ${error || stderr}`);
//                         loadingIndicator.hide();
//                         return;
//                     }
//                     vscode.window.showInformationMessage('Dependency installed successfully.');
//                     continueExtensionExecution();
//                 });
//             }
//         });
//     });

    
//     function continueExtensionExecution() {
//         vscode.window.showInformationMessage('UNITWISE EXTENSION started successfully.');
//         vscode.window.showOpenDialog({
//             canSelectFiles: false,
//             canSelectFolders: true,
//             openLabel: 'Select Directory'
//         }).then(uri => {
//             if (!uri || uri.length === 0) {
//                 vscode.window.showErrorMessage('No directory selected.');
//                 loadingIndicator.hide(); 
//                 return;
//             }
//             const directoryPath = uri[0].fsPath;
//             vscode.window.showOpenDialog({
//                 canSelectFiles: true,
//                 canSelectFolders: false,
//                 openLabel: 'Select File'
//             }).then(uri => {
//                 if (!uri || uri.length === 0) {
//                     vscode.window.showErrorMessage('No file selected.');
//                     loadingIndicator.hide(); 
//                     return;
//                 }
//                 const filePath = uri[0].fsPath;
//                 fs.readFile(filePath, 'utf-8', async (err, data) => {
//                     if (err) {
//                         vscode.window.showErrorMessage(`Error reading file: ${err.message}`);
//                         loadingIndicator.hide(); 
//                         return;
//                     }
//                     const newFileName = path.basename(filePath);
//                     const extension = newFileName.split('.').pop().toLowerCase();
//                     let language = '';
//                     if (extension === 'py') {
//                         language = 'python';
//                     } else if (extension === 'js') {
//                         language = 'javascript';
//                     } else if (extension === 'ts') {
//                         language = 'typescript';
//                     } else if (extension === 'go') {
//                         language = 'golang';
//                     } else {
//                         vscode.window.showErrorMessage('Unsupported file extension.');
//                         loadingIndicator.hide(); 
//                         return;
//                     }
//                     const newFilePath = path.join(directoryPath, `uwtest.${extension}`);
//                     fs.writeFile(newFilePath, data, async (err) => {
//                         if (err) {
//                             vscode.window.showErrorMessage(`Error writing file: ${err.message}`);
//                             loadingIndicator.hide();
//                             return;
//                         }
//                         vscode.window.showInformationMessage(`File ${newFilePath} created successfully.`);
//                         await generateEdgeCasesAndCode(data, directoryPath, language);
//                     });
//                 });
//             });
//         });
//     }
    

//     // Add the disposable to the context subscriptions
//     context.subscriptions.push(disposable);
//     let disposableCodeLens = vscode.languages.registerCodeLensProvider('*', {
//         provideCodeLenses(document, token) {
//             const codeLenses = [];
//             const regexMap = {
//                 'python': /(?:class|def)\s+\w+/g,
//                 'javascript': /(?:function|class)\s+\w+/g,
//                 'typescript': /(?:function|class)\s+\w+/g,
//                 'go': /(?:func|type|struct)\s+\w+/g
//             };
            
//             const languageId = document.languageId;
//             const regex = regexMap[languageId];
//             if (!regex) {
//                 return [];
//             }
//             let match;
//             while ((match = regex.exec(document.getText()))) {
//                 const startPos = document.positionAt(match.index);
//                 const endPos = document.positionAt(match.index + match[0].length);
//                 const range = new vscode.Range(startPos, endPos);
//                 const command = {
//                     title: "unitwise",
//                     command: "extension.swanaitesting",
//                     arguments: []
//                 };
//                 const codeLens = new vscode.CodeLens(range, command);
//                 codeLenses.push(codeLens);
//             }
//             return codeLenses;
//         }
//     });
//     context.subscriptions.push(disposableCodeLens);
// }



// //----------------------------------------------------------------
// //                    WEBVIEW / FRONTEND
// //----------------------------------------------------------------
// function showResultsInWebView(edgeCases, generatedCode, logs, reasons_go, fixed_formatCode_go,  fixed_test_code, filePath) {
//     const panel = vscode.window.createWebviewPanel(
//         'edgeCasesWebView',
//         'Edge Cases & Generated Code',
//         vscode.ViewColumn.Two,
//         {
//             enableScripts: true
//         }
//     );

//     let htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Edge Cases & Generated Code</title>
//         <style>
//             body {
//                 font-family: Arial, sans-serif;
//                 margin: 20px;
//             }
//             h2 {
//                 color: #333;
//             }
//             pre {
//                 background-color: #f5f5f5;
//                 padding: 10px;
//                 border-radius: 5px;
//                 overflow-x: auto;
//             }
//         </style>
//     </head>
//     <body>
//     <h2>Edge Cases:</h2>

//     ${edgecases_used ? `
//         <h2>Previous Test Cases:</h2>
//         <pre id="edgeCases">${edgecases_used}</pre>
//     ` : ''}
    
//     <h2>New Test Cases:</h2>
//     <pre id="newEdgeCases">${edgeCases}</pre>
    
        
//         <h2>Generated Code:</h2>
//         <pre id="generatedCode">${generatedCode}</pre>

//         <button id="showMoreEdgeCases">Show More Test Cases</button>
//         <button id="showLogs">Run</button>
//         <button id="showReasons" style="display: none;">Show Failure Reasons</button>
//         <button id="fixTestCodeButton" style="display: none;">Fix Test Case Code</button>
//         <button id="fixOriginalCodeButton" style="display: none;">Fix Original Code</button>

//         <pre id="logs" style="display: none;">${logs}</pre>
//         <pre id="reasons" style="display: none;">${reasons_go}</pre>
//         <pre id="fixedTestCode" style="display: none;">${fixed_test_code}</pre>
//         <pre id="fixedCode" style="display: none;">${fixed_formatCode_go}</pre>
//         <pre id="moreEdgeCases" style="display: none;"></pre>
//         <pre id="moreEdgeCasesCode" style="display: none;"></pre>
//     </body>
//     <script>
//         const vscode = acquireVsCodeApi();

//         const showMoreEdgeCasesButton = document.getElementById('showMoreEdgeCases');
//         const showLogsButton = document.getElementById('showLogs');
//         const showReasonsButton = document.getElementById('showReasons');
//         const fixTestCodeButton = document.getElementById('fixTestCodeButton');
//         const fixOriginalCodeButton = document.getElementById('fixOriginalCodeButton');
        
//         const logsPre = document.getElementById('logs');
//         const reasonsPre = document.getElementById('reasons');
//         const fixedTestCodePre = document.getElementById('fixedTestCode');
//         const fixedCodePre = document.getElementById('fixedCode');
//         const moreEdgeCasesPre = document.getElementById('moreEdgeCases');
//         const moreEdgeCasesCodePre = document.getElementById('moreEdgeCasesCode');

//         showMoreEdgeCasesButton.addEventListener('click', () => {
//             vscode.postMessage({
//                 command: 'rerunExtension'
//             });
//         });

//         showLogsButton.addEventListener('click', () => {
//             logsPre.style.display = 'block';
//             showLogsButton.style.display = 'none';
//             showReasonsButton.style.display = 'inline-block';
//         });

//         showReasonsButton.addEventListener('click', () => {
//             reasonsPre.style.display = 'block';
//             showReasonsButton.style.display = 'none';
//             fixTestCodeButton.style.display = 'inline-block';
//             fixOriginalCodeButton.style.display = 'inline-block';
//         });

//         fixTestCodeButton.addEventListener('click', () => {
//             fixedTestCodePre.style.display = 'block';
//             fixTestCodeButton.style.display = 'none';
//             // Send message to extension to save fixed test code
//             vscode.postMessage({
//                 command: 'saveFixedTestCode',
//                 content: fixedTestCodePre.innerText
//             });
//         });

//         fixOriginalCodeButton.addEventListener('click', () => {
//             fixedCodePre.style.display = 'block';
//             fixOriginalCodeButton.style.display = 'none';
//         });
//     </script>
//     </html>
//     `;

//     panel.webview.html = htmlContent;

//     panel.webview.onDidReceiveMessage(message => {
//         switch (message.command) {
//             case 'saveFixedTestCode':
//                 saveFixedTestCode(message.content, filePath);
//                 break;
//             case 'rerunExtension':
//                 edgecases_used=edgecases_used+edgeCases;
//                 extra_test_case_count=extra_test_case_count+3;
//                 vscode.commands.executeCommand('extension.swanaitesting');
//                 break;
//             default:
//                 console.error('Unhandled message:', message);
//         }
//     });

//     function saveFixedTestCode(content, filePath) {
//         fs.writeFile(filePath, content, err => {
//             if (err) {
//                 vscode.window.showErrorMessage(`Error saving fixed test code: ${err.message}`);
//                 return;
//             }
//             vscode.window.showInformationMessage(`Fixed test code saved to: ${filePath}`);
//         });
//     }
// }

// module.exports = {
//     activate,
// };
//----------------------------------------------------------------
//                     DEPENDENCIES
//----------------------------------------------------------------
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require("openai");
const { exec } = require('child_process');

//----------------------------------------------------------------
//                  GLOBAL VARIABLES
//----------------------------------------------------------------
const openai = new OpenAI({ apiKey: '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' });
const test_cases = 3;
let language = "";
let edgecases_used = "";
let extra_test_case_count = 0;
let loadingIndicator; // Declare loadingIndicator variable here

//----------------------------------------------------------------
//                  FORMAT THE CODE
//----------------------------------------------------------------

// PYTHON
async function formatGeneratedCode(generatedCode) {
    generatedCode = generatedCode.replace(/`/g, '');
    generatedCode = generatedCode.replace(/^```python/, '').replace(/```$/, '');
    generatedCode = generatedCode.replace(/^python\s*/, '');
    return generatedCode;
}

// JAVASCRIPT
async function formatGeneratedCodeJS(generatedCode) {
    generatedCode = generatedCode.replace(/`/g, '');
    generatedCode = generatedCode.replace(/^```javascript/, '').replace(/```$/, '');
    generatedCode = generatedCode.replace(/^javascript\s*/, '');
    generatedCode = generatedCode.trim();
    return generatedCode;
}

// TYPESCRIPT
async function formatGeneratedCodeTS(generatedCode) {
    generatedCode = generatedCode.replace(/`/g, '');
    generatedCode = generatedCode.replace(/^```typescript/, '').replace(/```$/, '');
    generatedCode = generatedCode.replace(/^typescript\s*/, '');
    generatedCode = generatedCode.trim();
    return generatedCode;
}

// GOLANG
async function formatGeneratedCodeGo(generatedCode) {
    generatedCode = generatedCode.replace(/`/g, '');
    generatedCode = generatedCode.replace(/^```go/, '').replace(/```$/, '');
    generatedCode = generatedCode.replace(/^go\s*/, '');
    generatedCode = generatedCode.trim();
    return generatedCode;
}

//----------------------------------------------------------------
//                 FIX TEST CODE
//----------------------------------------------------------------
async function fixtestcode(generatedCode, logs, language) {
    try {
        const model = "gpt-3.5-turbo"; // GPT-3.5 Turbo model
        const prompt = `Return only and only fixed code, by analyzing the following ${language} code and \n\nGenerated Code:\n${generatedCode}\n\nLogs:\n${logs},Return only and only fixed code no test no reasons nothingjust fixed code`;
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "system", content: prompt }],
            max_tokens: 900,
            temperature: 0.7,
            n: 1 
        });

        const fixedCode = response.choices[0].message.content.trim();
        return fixedCode;
    } catch (error) {
        console.error('Error fixing test code:', error);
        return 'Failed to fix test code. Please try again later.';
    }
}

//----------------------------------------------------------------
//                 FAILURE REASON
//----------------------------------------------------------------
async function analyzeFailureReasons(generatedCode, logs, language) {
    try {
        const model = "gpt-3.5-turbo"; 
        const prompt = `Analyze the following ${language} code and logs to determine possible reasons for failure:\n\nGenerated Code:\n${generatedCode}\n\nLogs:\n${logs},Return ALL OK if no errors in logs otherwise return reason in English and not code`;
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "system", content: prompt }],
            max_tokens: 100,
            temperature: 0.7,
            n: 1 
        });

        const failureReasons = response.choices[0].message.content.trim();
        return failureReasons;
    } catch (error) {
        console.error('Error analyzing failure reasons:', error);
        return 'Failed to analyze failure reasons. Please try again later.';
    }
}

//----------------------------------------------------------------
//                       FIX CODE
//----------------------------------------------------------------
async function fixCode(code, generatedCode, logs, reasons, language) {
    try {
        const model = "gpt-3.5-turbo"; 
        const prompt = `You're tasked with fixing the provided ${language} code:

        
        ${code}
        
        The code, when tested with the following test cases:
        
        \`\`\`
        ${generatedCode}
        \`\`\`
        
        Encountered the following errors:
        
        \`\`\`
        ${logs}
        \`\`\`
        
        Based on the analysis, the reason for these errors is:
        
        \`\`\`
        ${reasons}
        \`\`\`
        
        Your task is to provide the fixed code, ensuring it's complete and functional. Please provide the fixed code without any comments or additional text, strictly adhering to the code structure. `;
        
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "system", content: prompt }],
            max_tokens: 900,
            temperature: 0.7,
            n: 1 
        });
        
        const fixedCode = response.choices[0].message.content.trim();
        return fixedCode;
    } catch (error) {
        console.error('Error fixing code:', error);
        return 'Failed to fix code. Please try again later.';
    }
}


//----------------------------------------------------------------
//                    EDGE CASE AND ITS CODE
//----------------------------------------------------------------
async function generateEdgeCasesAndCode(code, directoryPath, language) {
    const totalcases=test_cases+extra_test_case_count;
    vscode.window.showInformationMessage(`Total Test Codes Asked are :${totalcases}.`);

    try {
        // EDGE CASES
        const prompt = `Generate ${test_cases} test cases in plain English for the following code:\n\n${code}

        Please provide the test cases using hyphens, for example:
        - Test Case:Describe the first test case here.
        - Test Case:Describe the second test case here.
        - Test Case:Describe the third test case here.
                `;
        const edgeCasesResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
            max_tokens: 900
        });
        const edgeCases = edgeCasesResponse.choices[0].message.content.trim();

        // EDGE CASES CODE+FORMATTING
        const codePrompt = `
Strict Prompt: Provide exactly ${totalcases}test cases code and  no less than ${totalcases} test cases codes.Provide only code, no reasons or explanations. Provide code for all given test cases below without missing any. So a total of ${totalcases} test cases code should be given. Ensure that the count of test cases code matches the expected number.

Generate ${language} code suitable for unit testing. Ensure to include a main function for executing the code with the provided edge cases:

\`\`\`
${edgeCases}

${edgecases_used}
\`\`\`

Assume that the original code is located in 'uwtest'. Include any necessary import statements if functions need to be imported.

Please provide the code without any comments or additional text, strictly following the appropriate testing format. Ensure that the code includes a main function for execution and avoid adding trailing backticks.`;

        
        const codeResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: codePrompt }],
            temperature: 0.7,
            max_tokens: 900
        });
        let generatedCode = codeResponse.choices[0].message.content.trim();

        if (language === 'python') {
            generatedCode = await formatGeneratedCode(generatedCode);
        } else if (language === 'javascript') {
            generatedCode = await formatGeneratedCodeJS(generatedCode);
        } else if (language === 'typescript') {
            generatedCode = await formatGeneratedCodeTS(generatedCode);
        } else if (language === 'golang') {
            generatedCode = await formatGeneratedCodeGo(generatedCode);
        }

        let newFileName;
        if (language === 'python') {
            newFileName = 'generated_test.py';
        } else if (language === 'javascript') {
            newFileName = 'generated_test.js';
        } else if (language === 'typescript') {
            newFileName = 'generated_test.ts';
        } else if (language === 'golang') {
            newFileName = 'generated_test.go';
        }
        const newFilePath = path.join(directoryPath, newFileName);
        fs.writeFile(newFilePath, generatedCode, async (err) => {
            if (err) {
                vscode.window.showErrorMessage(`Error writing file: ${err.message}`);
                return;
            }
            vscode.window.showInformationMessage(`File ${newFilePath} created successfully.`);
            runCodeFile(code, edgeCases, generatedCode, newFilePath, language);
        });

    } catch (error) {
        vscode.window.showErrorMessage('Error generating edge cases and code: ' + error.message);
    }
}


//----------------------------------------------------------------
//                      RUN CODE
//----------------------------------------------------------------

async function runCodeFile(code, edgeCases, generatedCode, filePath, language) {
    try {
        let command = '';
        if (language === 'python') {
            command = `python3 ${filePath}`;
        } else if (language === 'javascript') {
            command = `node ${filePath}`;
        } else if (language === 'typescript') {
            command = `ts-node ${filePath}`;
        } else if (language === 'golang') {
            command = `go run ${filePath}`;
        } else {
            throw new Error('Unsupported language');
        }

        exec(command, async (error, stdout, stderr) => {
            let logs = '';
            if (stdout) {
                logs += stdout.toString();
            }
            if (stderr) {
                logs += stderr.toString();
            }

            if (language === 'python') {
                const reasons = await analyzeFailureReasons(generatedCode, logs, language);
                const fix_test_code = await fixtestcode(generatedCode, logs, language);
                const fixed_test_code = await formatGeneratedCode(fix_test_code);
                const fixedCode = await fixCode(code, generatedCode, logs, reasons, language);
                const fixed_formatCode = await formatGeneratedCode(fixedCode);

                showResultsInWebView(edgeCases, generatedCode, logs, reasons, fixed_formatCode, fixed_test_code, filePath,code);
                loadingIndicator.hide(); 

            } else if (language === 'javascript') {
                const reasons_j = await analyzeFailureReasons(generatedCode, logs, language);
                const fix_test_code = await fixtestcode(generatedCode, logs, language);
                const fixed_test_code = await formatGeneratedCodeJS(fix_test_code);
                const fixedCode_j = await fixCode(code, generatedCode, logs, reasons_j, language);
                const fixed_formatCode_j = await formatGeneratedCodeJS(fixedCode_j);

                showResultsInWebView(edgeCases, generatedCode, logs, reasons_j, fixed_formatCode_j, fixed_test_code, filePath,code);
                loadingIndicator.hide(); 

            } else if (language === 'typescript') {
                const reasons_ts = await analyzeFailureReasons(generatedCode, logs, language);
                const fix_test_code = await fixtestcode(generatedCode, logs, language);
                const fixed_test_code = await formatGeneratedCodeTS(fix_test_code);
                const fixedCode_ts = await fixCode(code, generatedCode, logs, reasons_ts, language);
                const fixed_formatCode_ts = await formatGeneratedCodeTS(fixedCode_ts);

                showResultsInWebView(edgeCases, generatedCode, logs, reasons_ts, fixed_formatCode_ts, fixed_test_code, filePath,code);
                loadingIndicator.hide(); 

            } else if (language === 'golang') {
                const reasons_go = await analyzeFailureReasons(generatedCode, logs, language);
                const fix_test_code = await fixtestcode(generatedCode, logs, language);
                const fixed_test_code = await formatGeneratedCodeGo(fix_test_code);
                const fixedCode_go = await fixCode(code, generatedCode, logs, reasons_go, language);
                const fixed_formatCode_go = await formatGeneratedCodeGo(fixedCode_go);

                showResultsInWebView(edgeCases, generatedCode, logs, reasons_go, fixed_formatCode_go, fixed_test_code, filePath,code);
                loadingIndicator.hide(); 

            }
        });
    } catch (error) {
        console.error('Error running code:', error);
    }
}

function activate(context) {
    let runButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    runButton.text = "$(triangle-right) Run Unitwise";
    runButton.command = 'extension.swanaitesting';
    runButton.tooltip = 'Run the extension';
    runButton.show();

    const terminal = vscode.window.createTerminal("Install Generative AI Dependency");

    let disposable = vscode.commands.registerCommand('extension.swanaitesting', async () => {
        loadingIndicator = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left); // Initialize loadingIndicator here
        loadingIndicator.text = "$(sync~spin) Analyzing...";
        loadingIndicator.show();
    
        exec("npm list --depth 0 openai", (error, stdout, stderr) => {
            if (stdout.includes('openai')) {
                vscode.window.showInformationMessage('Dependency already installed.');
                continueExtensionExecution();
            } else {
                terminal.sendText("npm install --save openai");
                terminal.show();
    
                exec("npm install --save openai", (error, stdout, stderr) => {
                    if (error || stderr) {
                        vscode.window.showErrorMessage(`Failed to install dependency: ${error || stderr}`);
                        loadingIndicator.hide();
                        return;
                    }
                    vscode.window.showInformationMessage('Dependency installed successfully.');
                    continueExtensionExecution();
                });
            }
        });
    });

    
    function continueExtensionExecution() {
        vscode.window.showInformationMessage('UNITWISE EXTENSION started successfully.');
        vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            openLabel: 'Select Directory'
        }).then(uri => {
            if (!uri || uri.length === 0) {
                vscode.window.showErrorMessage('No directory selected.');
                loadingIndicator.hide(); 
                return;
            }
            const directoryPath = uri[0].fsPath;
            vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                openLabel: 'Select File'
            }).then(uri => {
                if (!uri || uri.length === 0) {
                    vscode.window.showErrorMessage('No file selected.');
                    loadingIndicator.hide(); 
                    return;
                }
                const filePath = uri[0].fsPath;
                fs.readFile(filePath, 'utf-8', async (err, data) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error reading file: ${err.message}`);
                        loadingIndicator.hide(); 
                        return;
                    }
                    const newFileName = path.basename(filePath);
                    const extension = newFileName.split('.').pop().toLowerCase();
                    let language = '';
                    if (extension === 'py') {
                        language = 'python';
                    } else if (extension === 'js') {
                        language = 'javascript';
                    } else if (extension === 'ts') {
                        language = 'typescript';
                    } else if (extension === 'go') {
                        language = 'golang';
                    } else {
                        vscode.window.showErrorMessage('Unsupported file extension.');
                        loadingIndicator.hide(); 
                        return;
                    }
                    const newFilePath = path.join(directoryPath, `uwtest.${extension}`);
                    fs.writeFile(newFilePath, data, async (err) => {
                        if (err) {
                            vscode.window.showErrorMessage(`Error writing file: ${err.message}`);
                            loadingIndicator.hide();
                            return;
                        }
                        vscode.window.showInformationMessage(`File ${newFilePath} created successfully.`);
                        await generateEdgeCasesAndCode(data, directoryPath, language);
                    });
                });
            });
        });
    }
    

    // Add the disposable to the context subscriptions
    context.subscriptions.push(disposable);
    let disposableCodeLens = vscode.languages.registerCodeLensProvider('*', {
        provideCodeLenses(document, token) {
            const codeLenses = [];
            const regexMap = {
                'python': /(?:class|def)\s+\w+/g,
                'javascript': /(?:function|class)\s+\w+/g,
                'typescript': /(?:function|class)\s+\w+/g,
                'go': /(?:func|type|struct)\s+\w+/g
            };
            
            const languageId = document.languageId;
            const regex = regexMap[languageId];
            if (!regex) {
                return [];
            }
            let match;
            while ((match = regex.exec(document.getText()))) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                const command = {
                    title: "unitwise",
                    command: "extension.swanaitesting",
                    arguments: []
                };
                const codeLens = new vscode.CodeLens(range, command);
                codeLenses.push(codeLens);
            }
            return codeLenses;
        }
    });
    context.subscriptions.push(disposableCodeLens);
}



//----------------------------------------------------------------
//                    WEBVIEW / FRONTEND
//----------------------------------------------------------------
function showResultsInWebView(edgeCases, generatedCode, logs, reasons_go, fixed_formatCode_go,  fixed_test_code, filePath,originalcode) {
    const panel = vscode.window.createWebviewPanel(
        'edgeCasesWebView',
        'Edge Cases & Generated Code',
        vscode.ViewColumn.Two,
        {
            enableScripts: true
        }
    );

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edge Cases & Generated Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h2 {
                color: #333;
            }
            pre {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 5px;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
    <h2>Edge Cases:</h2>

    ${edgecases_used ? `
        <h2>Previous Test Cases:</h2>
        <pre id="edgeCases">${edgecases_used}</pre>
    ` : ''}
    
    <h2>New Test Cases:</h2>
    <pre id="newEdgeCases">${edgeCases}</pre>
    
        
        <h2>Generated Code:</h2>
        <pre id="generatedCode">${generatedCode}</pre>

        <button id="showMoreEdgeCases">Show More Test Cases</button>
        <button id="showLogs">Run</button>
        <button id="showReasons" style="display: none;">Show Failure Reasons</button>
        <button id="fixTestCodeButton" style="display: none;">Fix Test Case Code</button>
        <button id="fixOriginalCodeButton" style="display: none;">Fix Original Code</button>

        <pre id="logs" style="display: none;">${logs}</pre>
        <pre id="reasons" style="display: none;">${reasons_go}</pre>
        <pre id="fixedTestCode" style="display: none;">${fixed_test_code}</pre>
        <pre id="fixedCode" style="display: none;">${fixed_formatCode_go}</pre>
        <pre id="moreEdgeCases" style="display: none;"></pre>
        <pre id="moreEdgeCasesCode" style="display: none;"></pre>
    </body>
    <script>
        const vscode = acquireVsCodeApi();

        const showMoreEdgeCasesButton = document.getElementById('showMoreEdgeCases');
        const showLogsButton = document.getElementById('showLogs');
        const showReasonsButton = document.getElementById('showReasons');
        const fixTestCodeButton = document.getElementById('fixTestCodeButton');
        const fixOriginalCodeButton = document.getElementById('fixOriginalCodeButton');
        
        const logsPre = document.getElementById('logs');
        const reasonsPre = document.getElementById('reasons');
        const fixedTestCodePre = document.getElementById('fixedTestCode');
        const fixedCodePre = document.getElementById('fixedCode');
        const moreEdgeCasesPre = document.getElementById('moreEdgeCases');
        const moreEdgeCasesCodePre = document.getElementById('moreEdgeCasesCode');

        showMoreEdgeCasesButton.addEventListener('click', () => {
            vscode.postMessage({
                command: 'rerunExtension'
            });
        });

        showLogsButton.addEventListener('click', () => {
            logsPre.style.display = 'block';
            showLogsButton.style.display = 'none';
            showReasonsButton.style.display = 'inline-block';
        });

        showReasonsButton.addEventListener('click', () => {
            reasonsPre.style.display = 'block';
            showReasonsButton.style.display = 'none';
            fixTestCodeButton.style.display = 'inline-block';
            fixOriginalCodeButton.style.display = 'inline-block';
        });

        fixTestCodeButton.addEventListener('click', () => {
            fixedTestCodePre.style.display = 'block';
            fixTestCodeButton.style.display = 'none';
            // Send message to extension to save fixed test code
            vscode.postMessage({
                command: 'saveFixedTestCode',
                content: fixedTestCodePre.innerText
            });
        });

        fixOriginalCodeButton.addEventListener('click', () => {
            fixedCodePre.style.display = 'block';
            fixOriginalCodeButton.style.display = 'none';
        });
    </script>
    </html>
    `;

    panel.webview.html = htmlContent;

    panel.webview.onDidReceiveMessage(message => {
        switch (message.command) {
            case 'saveFixedTestCode':
                saveFixedTestCode(message.content, filePath);
                break;
            case 'rerunExtension':
                edgecases_used=edgecases_used+edgeCases;
                extra_test_case_count=extra_test_case_count+3;
                vscode.commands.executeCommand('extension.swanaitesting');
                break;
            default:
                console.error('Unhandled message:', message);
        }
    });

    function saveFixedTestCode(content, filePath) {
        fs.writeFile(filePath, content, err => {
            if (err) {
                vscode.window.showErrorMessage(`Error saving fixed test code: ${err.message}`);
                return;
            }
            vscode.window.showInformationMessage(`Fixed test code saved to: ${filePath}`);
        });
    }
}

module.exports = {
    activate,
};
