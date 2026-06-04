import { TOKENS, KEYWORDS } from "./tokens.js";
import { createError } from "./errors.js";

export function tokenize(source, filename = "<anonymous>") {
  const tokens = [];
  let position = 0;
  let line = 1;
  let column = 1;
  
  function getSourceLine(targetLine) {
    const lines = source.split(/\r?\n/);
    return lines[targetLine - 1] || "";
  }
  
  function error(msg) {
    throw createError({
      category: "LexError",
      message: msg,
      filename,
      line,
      column,
      sourceLine: getSourceLine(line)
    });
  }

  function peek(offset = 0) {
    return position + offset < source.length ? source[position + offset] : null;
  }
  
  function advance() {
    const char = source[position];
    position++;
    if (char === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return char;
  }

  while (position < source.length) {
    const startPos = position;
    const startCol = column;
    const startLine = line;
    const c = peek();
    
    // whitespace (not newline)
    if (c === ' ' || c === '\t' || c === '\r') {
      advance();
      continue;
    }
    
    if (c === '\n') {
      advance();
      tokens.push({ type: TOKENS.NEWLINE, value: "\n", line: startLine, column: startCol, start: startPos, end: position });
      continue;
    }
    
    // Comments
    if (c === '/' && peek(1) === '/') {
      while (peek() !== null && peek() !== '\n') {
        advance();
      }
      continue;
    }
    
    if (c === '/' && peek(1) === '*') {
      advance(); // /
      advance(); // *
      let terminated = false;
      while (peek() !== null) {
        if (peek() === '*' && peek(1) === '/') {
          advance();
          advance();
          terminated = true;
          break;
        }
        advance();
      }
      if (!terminated) {
        error("Unterminated block comment");
      }
      continue;
    }
    
    // Punctuation
    const punct = {
      '(': TOKENS.LEFT_PAREN, ')': TOKENS.RIGHT_PAREN,
      '{': TOKENS.LEFT_BRACE, '}': TOKENS.RIGHT_BRACE,
      '[': TOKENS.LEFT_BRACKET, ']': TOKENS.RIGHT_BRACKET,
      ',': TOKENS.COMMA, '.': TOKENS.DOT,
      ':': TOKENS.COLON, ';': TOKENS.SEMICOLON
    };
    
    if (punct[c]) {
      advance();
      tokens.push({ type: punct[c], value: c, line: startLine, column: startCol, start: startPos, end: position });
      continue;
    }
    
    // Operators
    if ("=+-*/%<>!".includes(c)) {
      let op = advance();
      let type;
      if (c === '=' && peek() === '=') { op += advance(); type = TOKENS.EQUAL_EQUAL; }
      else if (c === '=' && peek() !== '=') { type = TOKENS.EQUAL; }
      else if (c === '!' && peek() === '=') { op += advance(); type = TOKENS.BANG_EQUAL; }
      else if (c === '!') { error(`Invalid character '!'`); }
      else if (c === '>' && peek() === '=') { op += advance(); type = TOKENS.GREATER_EQUAL; }
      else if (c === '>') { type = TOKENS.GREATER; }
      else if (c === '<' && peek() === '=') { op += advance(); type = TOKENS.LESS_EQUAL; }
      else if (c === '<') { type = TOKENS.LESS; }
      else if (c === '+' && peek() === '=') { op += advance(); type = TOKENS.PLUS_EQUAL; }
      else if (c === '+') { type = TOKENS.PLUS; }
      else if (c === '-' && peek() === '=') { op += advance(); type = TOKENS.MINUS_EQUAL; }
      else if (c === '-') { type = TOKENS.MINUS; }
      else if (c === '*' && peek() === '*') { op += advance(); type = TOKENS.STAR_STAR; }
      else if (c === '*' && peek() === '=') { op += advance(); type = TOKENS.STAR_EQUAL; }
      else if (c === '*') { type = TOKENS.STAR; }
      else if (c === '/' && peek() === '=') { op += advance(); type = TOKENS.SLASH_EQUAL; }
      else if (c === '/') { type = TOKENS.SLASH; }
      else if (c === '%') { type = TOKENS.PERCENT; }
      
      tokens.push({ type, value: op, line: startLine, column: startCol, start: startPos, end: position });
      continue;
    }
    
    // Strings
    if (c === '"' || c === "'") {
      const quote = advance();
      let val = "";
      let terminated = false;
      let hasInterpolation = false;
      while (peek() !== null) {
        const char = peek();
        if (char === quote) {
          advance();
          terminated = true;
          break;
        }
        
        if (char === '\\') {
          advance(); // consume '\'
          const next = peek();
          if (next === 'n') { val += '\n'; advance(); }
          else if (next === 't') { val += '\t'; advance(); }
          else if (next === 'r') { val += '\r'; advance(); }
          else if (next === '\\') { val += '\\'; advance(); }
          else if (next === '"') { val += '"'; advance(); }
          else if (next === "'") { val += "'"; advance(); }
          else if (next !== null) {
            val += '\\' + advance();
          } else {
            error("Unterminated string literal");
          }
          continue;
        }

        if (char === '$' && peek(1) === '{') {
          hasInterpolation = true;
        }
        val += advance();
      }
      if (!terminated) {
        error("Unterminated string literal");
      }
      const t = { type: TOKENS.STRING, value: val, line: startLine, column: startCol, start: startPos, end: position };
      t.hasInterpolation = hasInterpolation;
      tokens.push(t);
      continue;
    }
    
    // Numbers
    if (/[0-9]/.test(c)) {
      let val = "";
      let hasDecimal = false;
      while (peek() !== null && /[0-9_.]/.test(peek())) {
        const nextChar = peek();
        if (nextChar === '.') {
          if (hasDecimal) error("Malformed number: multiple decimals");
          hasDecimal = true;
        }
        val += advance();
      }
      
      if (val.endsWith('_')) error("Malformed number: cannot end with underscore");
      if (val.endsWith('.')) error("Malformed number: cannot end with decimal");
      if (val.includes('__')) error("Malformed number: consecutive underscores are not allowed");
      if (val.includes('._') || val.includes('_.')) error("Malformed number: underscore cannot be adjacent to decimal");

      if (peek() !== null && /[a-zA-Z]/.test(peek())) {
        error("Identifier cannot immediately follow a number");
      }

      tokens.push({ type: TOKENS.NUMBER, value: val, line: startLine, column: startCol, start: startPos, end: position });
      continue;
    }
    
    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(c)) {
      let val = "";
      while (peek() !== null && /[a-zA-Z0-9_]/.test(peek())) {
        val += advance();
      }
      let type = TOKENS.IDENTIFIER;
      if (KEYWORDS[val]) {
        type = KEYWORDS[val];
      }
      tokens.push({ type, value: val, line: startLine, column: startCol, start: startPos, end: position });
      continue;
    }
    
    // If we reach here, invalid character
    error(`Invalid character '${c}'`);
  }
  
  tokens.push({ type: TOKENS.EOF, value: "", line, column, start: position, end: position });
  return tokens;
}
