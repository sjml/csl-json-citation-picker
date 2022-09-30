* watch library file(s) for changes?
* would be nice to have it do a live search as you type, like the Zotero picker
  * I don't think you can with VS Code's UI, though; has to switch between a search and a picker
  * alternative idea: add *everything* to the quickpick? that seems.... bad?
    * couldn't use minisearch to grep through all the fields then, just the UI ones
    * https://github.com/microsoft/vscode/issues/90521
  * could make a custom UI thing somehow maybe? 
    * probably could do it, but seems to be non-recommended and more trouble than it's worth
    * https://github.com/microsoft/vscode-extension-samples/tree/main/webview-view-sample
    * https://code.visualstudio.com/api/references/vscode-api#WebviewView
* cache used references so they appear as options on first entry?
  * might be the same issue as the live-search; I don't think I can mix a text input and a picker :(
  * **COULD** do them as an autocomplete when you type `@` though...

