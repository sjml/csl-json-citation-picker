const vscode = require('vscode');
const config = vscode.workspace.getConfiguration('csl-json-citation-picker');

const fs = require('fs');
const path = require('path');
const MiniSearch = require('minisearch');

var searchableData = null;

function getShiftedCharacter(document, position, delta) {
  const line = document.lineAt(position.line);

  if (delta > 0) {
    delta -= 1;
  }
  const newPos = position.character + delta;
  if (newPos < 0 || newPos >= line.text.length) {
    return null;
  }
  return line.text[newPos];
}

async function showCitationPicker(searchTerm, resultSet) {
  const qpItems = resultSet.map((r) => {
    var authorString = null;
    if (r['author']) {
      const auth = r['author'][0];
      if (auth['literal']) {
        authorString = auth['literal'];
      }
      else if (auth['family'] && auth['given']) {
        authorString = `${auth['family']}, ${auth['given']}`;
      }
      else if (auth['family']) {
        authorString = auth['family'];
      }
      else if (auth['given']) {
        authorString = auth['given'];
      }
      else {
        authorString = null;
      }
      if (authorString && authorString.length > 0 && r['author'].length > 1) {
        authorString += ", et al.";
      }
    }

    var titleString = r['title'];
    if (r['issued'] && r['issued']['date-parts']) {
      titleString += ` (${r['issued']['date-parts'][0][0]})`;
    }

    return {
      label: authorString,
      description: r['citation-key'],
      detail: titleString,
    }
  });

  var chosenCite = await vscode.window.showQuickPick(qpItems, {
    matchOnDescription: true,
    matchOnDetail: true,
  });
  if (chosenCite == undefined) {
    showCitationSearcher(searchTerm);
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No editor to insert citation!");
    return;
  }

  editor.edit(e => editor.selections.forEach(s => {

    let startPosition = s.start;
    let endPosition = s.end;
    if ("@" == getShiftedCharacter(editor.document, startPosition, -1)) {
      startPosition = startPosition.translate({characterDelta: -1});
    }
    if ("[" == getShiftedCharacter(editor.document, startPosition, - 1)) {
      startPosition = startPosition.translate({characterDelta: -1});
    }
    if ("]" == getShiftedCharacter(editor.document, endPosition, 1)) {
      endPosition = endPosition.translate({characterDelta: 1});
    }

    const editRange = new vscode.Range(startPosition, endPosition);
    e.delete(editRange);

    // e.insert(editRange.start, `[@${chosenCite['description']}]`);
    const snipString = new vscode.SnippetString(`[@${chosenCite['description']}` + "${1:}]$0");
    editor.insertSnippet(snipString, editRange.start);
  }));
}

async function showCitationSearcher(searchTerm) {
  var searchedTerm = await vscode.window.showInputBox({
    value: searchTerm,
    placeHolder: "Search for a citation entry...",
    prompt: "Enter search terms (author, title, etc.)",
  });

  if (searchedTerm == undefined) {
    return;
  }

  const results = searchableData.search(searchedTerm, {prefix: true});
  if (results.length == 0) {
    vscode.window.showWarningMessage(`No results found for '${searchedTerm}'.`);
    showCitationSearcher(searchedTerm);
    return;
  }

  showCitationPicker(searchedTerm, results);
}

function loadConfig() {
  searchableData = null;

  var dataPath = config.libraryPath;
  if (dataPath[0] === '~') {
    dataPath = path.join(process.env.HOME, dataPath.slice(1));
  }
  dataPath = path.resolve(dataPath);

  const libs = [];

  if (!fs.existsSync(dataPath)) {
    vscode.window.showErrorMessage(`${config.libraryPath} does not exist.`);
    return;
  }

  libs.push(dataPath);

  if (libs.length == 0) {
    vscode.window.showErrorMessage(`No CSL files to load.`);
    return;
  }

  libs.forEach(libPath => {
    const citeDataText = fs.readFileSync(libPath).toString();
    var citeData = [];
    try {
      citeData = JSON.parse(citeDataText);
    } catch(err) {
      vscode.window.showErrorMessage(`${config.libraryPath} has invalid JSON.\n${err}`);
      return;
    }

    if (searchableData == null) {
      searchableData = new MiniSearch({
        idField: 'citation-key',
        fields: ['citation-key', 'authorSearch', 'title', 'short-title', 'keyword'],
        storeFields: ['citation-key', 'author', 'title', 'issued'],
        extractField: (doc, fn) => {
          if (fn == "title" || fn == "short-title" || fn == "keyword") {
            // probably a better way to strip HTML
            const f = doc[fn];
            if (f == undefined) {
              return "";
            }
            return f.replace(/<\/?[^>]+(>|$)/g, "");
          }
          if (fn == "authorSearch") {
            const authorList = doc["author"];
            if (authorList == undefined) {
              return "";
            }
            var aTerms = [];
            authorList.forEach(a => {
              Object.values(a).forEach(af => aTerms.push(af))
            });
            return aTerms.join(" ");
          }
          return doc[fn];
        }
      });
    }

    searchableData.addAll(citeData);
  });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  loadConfig();

  let disposable = vscode.commands.registerCommand('csl-json-citation-picker.insertCitation', function () {
    if (searchableData != null) {
      showCitationSearcher();
    }
    else {
      vscode.window.showErrorMessage(`No citation data loaded.`);
    }
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('csl-json-citation-picker.reloadLibrary', function() {
    loadConfig();
    vscode.window.showInformationMessage("Reloaded citation library!")
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
