# CSL JSON Citation Picker

I like using [Zotero](zotero.org/) to manage my research references, but I mostly write in Markdown, so the Word/Google Docs plugins are not as useful to me. There is [a VS Code plugin for Zotero](https://github.com/mblode/vscode-zotero) that is pretty popular and has a very slick interface, but I faced a couple issues with it: 

1. It requires Zotero to be running. I mostly use it to manage citations and export them to a bibliography file which doesn't change much, so it's annoying to have an extra app open for writing. 
2. The UI for it seemed very laggy, even on my pretty fast computer. I don't know if it's because it has to communicate over a local network connection or the UI toolkit is slow, but it just bugged me. 
3. The Zotero app (which has to be running, as we've said) steals focus after every cite insertion. 

All very mild annoyances, to be sure, but I couldn't shake the feeling that there had to be a better way to grep through just a megabyte or so of structured text. So I made this thing. Like the other extension, it also leverages the [Better BibTeX](https://retorque.re/zotero-better-bibtex/) extension for Zotero itself, but it only relies on the exported files that BBT keeps in sync, so the app itself is out of the loop. (Presumably, if you have some other source of generating CSL JSON files, you don't need Zotero at all. But it's what I use.)

**_NOTE: this only works with exported CSL JSON files, not with `.bib` files._** It probably would not be too hard to get this working with BibTeX, but JSON is super easy for JavaScript to ingest, and I was already using it anyway because of its better metadata export. 

## Usage

* Make sure to set the `csl-json-citation-picker.libraryPath` property to point to you local library export. For me, that's `~/Documents/Zotero_Library.json`. 
* Then, when you're working on a document and want to insert a citation, open the command palette and select "Insert Citation" **or** you can use the default keyboard shortcut of `Alt-Shift-Z`. (`Option-Shift-Z` on a Mac.) That brings up an input where you can enter a search term. 
* It will search your library for titles, authors, notes, and keywords matching the search term, and give you back a list you can choose from. 
* Pick one of those and the citation key will be inserted at your current edit point. 
* That's it! 

It probably is missing a lot of features that the Zotero picker offers, but honestly I wasn't using them anyway, and this just works faster. 

## Caveats

* This is quick and dirty. Probably bugs, but it's worked for me so far. 
* It does not automatically pick up changes to the JSON file. (On my todo list, but not high up.) There is a "Reload Citation Library" command that should do the trick if you invoke it manually, though. On VS Code startup it will reload the files, too. 
* It would be nice if there was some kind of live search (like the other extension has), but I can't see a way to hook that into VS Code's UI. You can only use a text input or a picker, but not both. :(
