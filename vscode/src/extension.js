const vscode = require("vscode");
const { KEYWORDS, getKeyword } = require("./keywords");

const LANGUAGE_SELECTOR = {
  language: "bnscript",
  scheme: "file",
};

function keywordMarkdown(entry) {
  const markdown = new vscode.MarkdownString();
  markdown.appendMarkdown(`**${entry.title}**\n\n`);
  markdown.appendMarkdown("Bangla:\n");
  markdown.appendText(entry.description_bn);
  markdown.appendMarkdown("\n\nEnglish:\n");
  markdown.appendText(entry.description_en);
  return markdown;
}

function createCompletionItem(entry) {
  const item = new vscode.CompletionItem(
    entry.keyword,
    vscode.CompletionItemKind.Keyword
  );
  item.detail = entry.title;
  item.documentation = keywordMarkdown(entry);
  item.insertText = entry.keyword;
  return item;
}

function activate(context) {
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGE_SELECTOR,
    {
      provideCompletionItems() {
        return KEYWORDS.map(createCompletionItem);
      },
    }
  );

  const hoverProvider = vscode.languages.registerHoverProvider(
    LANGUAGE_SELECTOR,
    {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z_]+/);
        if (!range) {
          return undefined;
        }

        const word = document.getText(range);
        const entry = getKeyword(word);
        if (!entry) {
          return undefined;
        }

        return new vscode.Hover(keywordMarkdown(entry), range);
      },
    }
  );

  context.subscriptions.push(completionProvider, hoverProvider);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
