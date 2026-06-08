import test from 'node:test';
import assert from 'node:assert';
import { tokenize } from '../src/lexer.js';
import { TOKENS, KEYWORDS } from '../src/tokens.js';

test('lexer: single keyword', () => {
  const tokens = tokenize('dhori');
  assert.strictEqual(tokens.length, 2); // DHORI, EOF
  assert.strictEqual(tokens[0].type, TOKENS.DHORI);
  assert.strictEqual(tokens[0].value, 'dhori');
});

test('lexer: all keywords', () => {
  for (const kw in KEYWORDS) {
    const tokens = tokenize(kw);
    assert.strictEqual(tokens[0].type, KEYWORDS[kw], `Keyword ${kw} should tokenize correctly`);
  }
});

test('lexer: automation primitives tokenize as IDENTIFIER', () => {
  const primitives = ['anro', 'faile', 'ai', 'env', 'wait', 'json'];
  for (const p of primitives) {
    const tokens = tokenize(p);
    assert.strictEqual(tokens[0].type, TOKENS.IDENTIFIER, `${p} should be IDENTIFIER`);
  }
});

test('lexer: identifiers', () => {
  const tokens = tokenize('myVar_123');
  assert.strictEqual(tokens[0].type, TOKENS.IDENTIFIER);
  assert.strictEqual(tokens[0].value, 'myVar_123');
});

test('lexer: numbers', () => {
  const tokens = tokenize('42');
  assert.strictEqual(tokens[0].type, TOKENS.NUMBER);
  assert.strictEqual(tokens[0].value, '42');
});

test('lexer: float numbers', () => {
  const tokens = tokenize('3.14159');
  assert.strictEqual(tokens[0].type, TOKENS.NUMBER);
  assert.strictEqual(tokens[0].value, '3.14159');
});

test('lexer: underscore number separators', () => {
  const tokens = tokenize('1_000_000');
  assert.strictEqual(tokens[0].type, TOKENS.NUMBER);
  assert.strictEqual(tokens[0].value, '1_000_000');
});

test('lexer: strings', () => {
  const tokens = tokenize('"hello" \'world\'');
  assert.strictEqual(tokens[0].type, TOKENS.STRING);
  assert.strictEqual(tokens[0].value, 'hello');
  assert.strictEqual(tokens[0].hasInterpolation, false);
  
  // space is skipped
  assert.strictEqual(tokens[1].type, TOKENS.STRING);
  assert.strictEqual(tokens[1].value, 'world');
});

test('lexer: strings with interpolation', () => {
  const tokens = tokenize('"hello ${name}"');
  assert.strictEqual(tokens[0].type, TOKENS.STRING);
  assert.strictEqual(tokens[0].value, 'hello ${name}');
  assert.strictEqual(tokens[0].hasInterpolation, true);
});

test('lexer: operators', () => {
  const ops = [
    { s: '+', t: TOKENS.PLUS },
    { s: '-', t: TOKENS.MINUS },
    { s: '*', t: TOKENS.STAR },
    { s: '/', t: TOKENS.SLASH },
    { s: '%', t: TOKENS.PERCENT },
    { s: '**', t: TOKENS.STAR_STAR },
    { s: '=', t: TOKENS.EQUAL },
    { s: '==', t: TOKENS.EQUAL_EQUAL },
    { s: '!=', t: TOKENS.BANG_EQUAL },
    { s: '>', t: TOKENS.GREATER },
    { s: '<', t: TOKENS.LESS },
    { s: '>=', t: TOKENS.GREATER_EQUAL },
    { s: '<=', t: TOKENS.LESS_EQUAL },
    { s: '+=', t: TOKENS.PLUS_EQUAL },
    { s: '-=', t: TOKENS.MINUS_EQUAL },
    { s: '*=', t: TOKENS.STAR_EQUAL },
    { s: '/=', t: TOKENS.SLASH_EQUAL },
  ];
  for (const {s, t} of ops) {
    const tokens = tokenize(s);
    assert.strictEqual(tokens[0].type, t, `Operator ${s} failed`);
  }
});

test('lexer: punctuation', () => {
  const source = '(){}[],.:;';
  const tokens = tokenize(source);
  assert.strictEqual(tokens[0].type, TOKENS.LEFT_PAREN);
  assert.strictEqual(tokens[1].type, TOKENS.RIGHT_PAREN);
  assert.strictEqual(tokens[2].type, TOKENS.LEFT_BRACE);
  assert.strictEqual(tokens[3].type, TOKENS.RIGHT_BRACE);
  assert.strictEqual(tokens[4].type, TOKENS.LEFT_BRACKET);
  assert.strictEqual(tokens[5].type, TOKENS.RIGHT_BRACKET);
  assert.strictEqual(tokens[6].type, TOKENS.COMMA);
  assert.strictEqual(tokens[7].type, TOKENS.DOT);
  assert.strictEqual(tokens[8].type, TOKENS.COLON);
  assert.strictEqual(tokens[9].type, TOKENS.SEMICOLON);
});

test('lexer: array object and member punctuation', () => {
  const source = 'names[0].profile = { name: "Risat" }';
  const tokens = tokenize(source);
  const types = tokens.map((token) => token.type);

  assert.deepStrictEqual(types, [
    TOKENS.IDENTIFIER,
    TOKENS.LEFT_BRACKET,
    TOKENS.NUMBER,
    TOKENS.RIGHT_BRACKET,
    TOKENS.DOT,
    TOKENS.IDENTIFIER,
    TOKENS.EQUAL,
    TOKENS.LEFT_BRACE,
    TOKENS.IDENTIFIER,
    TOKENS.COLON,
    TOKENS.STRING,
    TOKENS.RIGHT_BRACE,
    TOKENS.EOF,
  ]);
});

test('lexer: single-line comments', () => {
  const tokens = tokenize('// comment\ndhori');
  assert.strictEqual(tokens[0].type, TOKENS.NEWLINE);
  assert.strictEqual(tokens[1].type, TOKENS.DHORI);
});

test('lexer: multi-line comments', () => {
  const tokens = tokenize('/* multi\nline */dhori');
  assert.strictEqual(tokens[0].type, TOKENS.DHORI);
});

test('lexer: full mini-program', () => {
  const program = `dhori name = "Risat"
jodi name == "Risat" {
  dekhi name
}`;
  const tokens = tokenize(program);
  const types = tokens.map(t => t.type);
  
  assert.deepStrictEqual(types, [
    TOKENS.DHORI, TOKENS.IDENTIFIER, TOKENS.EQUAL, TOKENS.STRING, TOKENS.NEWLINE,
    TOKENS.JODI, TOKENS.IDENTIFIER, TOKENS.EQUAL_EQUAL, TOKENS.STRING, TOKENS.LEFT_BRACE, TOKENS.NEWLINE,
    TOKENS.DEKHI, TOKENS.IDENTIFIER, TOKENS.NEWLINE,
    TOKENS.RIGHT_BRACE, TOKENS.EOF
  ]);
});

test('lexer: invalid character error', () => {
  assert.throws(() => tokenize('!'), (err) => {
    return err.name === 'BNError' && err.message.includes('Invalid character');
  });
});

test('lexer: unterminated string error', () => {
  assert.throws(() => tokenize('"hello'), (err) => {
    return err.name === 'BNError' && err.message.includes('Unterminated string literal');
  });
});

test('lexer: unterminated block comment error', () => {
  assert.throws(() => tokenize('/* hello'), (err) => {
    return err.name === 'BNError' && err.message.includes('Unterminated block comment');
  });
});

test('lexer: malformed numbers throw errors', () => {
  const malformed = ['1.2.3', '123_', '123.', '1__23', '123abc', '1_.2', '1._2'];
  for (const num of malformed) {
    assert.throws(() => tokenize(num), (err) => {
      return err.name === 'BNError' && (err.message.includes('Malformed number') || err.message.includes('Identifier cannot immediately follow'));
    }, `Failed to throw for malformed number: ${num}`);
  }
});

test('lexer: escape sequences in strings', () => {
  const tokens = tokenize('"line1\\nline2\\t\\r\\\\\\"\\\'"');
  assert.strictEqual(tokens[0].value, 'line1\nline2\t\r\\\"\'');
});

test('lexer: location tracking', () => {
  const source = `dhori x = 10\ndekhi x`;
  const tokens = tokenize(source);
  
  // dhori
  assert.strictEqual(tokens[0].line, 1);
  assert.strictEqual(tokens[0].column, 1);
  assert.strictEqual(tokens[0].start, 0);
  assert.strictEqual(tokens[0].end, 5);
  
  // dekhi (on line 2)
  assert.strictEqual(tokens[5].type, TOKENS.DEKHI);
  assert.strictEqual(tokens[5].line, 2);
  assert.strictEqual(tokens[5].column, 1);
  assert.strictEqual(tokens[5].start, 13);
  assert.strictEqual(tokens[5].end, 18);
});

test('lexer: EOF token correctness', () => {
  const source = `dhori x = 10`;
  const tokens = tokenize(source);
  const eof = tokens[tokens.length - 1];
  
  assert.strictEqual(eof.type, TOKENS.EOF);
  assert.strictEqual(eof.value, '');
  assert.strictEqual(eof.line, 1);
  // column should be after '0' (length + 1)
  assert.strictEqual(eof.column, 13);
  assert.strictEqual(eof.start, 12);
  assert.strictEqual(eof.end, 12);
});
