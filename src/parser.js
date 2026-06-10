import { TOKENS } from "./tokens.js";
import { createError } from "./errors.js";
import * as AST from "./ast.js";

const BINARY_PRECEDENCE = new Map([
  [TOKENS.OTHOBA, 1],
  [TOKENS.EBONG, 2],
  [TOKENS.EQUAL_EQUAL, 3],
  [TOKENS.BANG_EQUAL, 3],
  [TOKENS.GREATER, 4],
  [TOKENS.LESS, 4],
  [TOKENS.GREATER_EQUAL, 4],
  [TOKENS.LESS_EQUAL, 4],
  [TOKENS.PLUS, 5],
  [TOKENS.MINUS, 5],
  [TOKENS.STAR, 6],
  [TOKENS.SLASH, 6],
  [TOKENS.PERCENT, 6],
  [TOKENS.STAR_STAR, 7],
]);

const ASSIGNMENT_OPERATORS = new Set([
  TOKENS.EQUAL,
  TOKENS.PLUS_EQUAL,
  TOKENS.MINUS_EQUAL,
  TOKENS.STAR_EQUAL,
  TOKENS.SLASH_EQUAL,
]);

const EXPRESSION_STARTS = new Set([
  TOKENS.IDENTIFIER,
  TOKENS.NUMBER,
  TOKENS.STRING,
  TOKENS.SOTTI,
  TOKENS.MITTHA,
  TOKENS.KHALI,
  TOKENS.NA,
  TOKENS.MINUS,
  TOKENS.ABR,
  TOKENS.LEFT_PAREN,
  TOKENS.LEFT_BRACKET,
  TOKENS.LEFT_BRACE,
]);

const UNSUPPORTED_STATEMENTS = new Map([
  [TOKENS.NAO, '"nao" imports are not supported in this alpha compiler.'],
  [TOKENS.DAO, '"dao" exports are not supported in this alpha compiler.'],
]);

export class Parser {
  constructor(tokens, { filename = "<anonymous>", source = "" } = {}) {
    this.tokens = tokens;
    this.index = 0;
    this.filename = filename;
    this.sourceLines = source ? source.split(/\r?\n/) : [];
    this.errors = [];
  }

  parseProgram() {
    const body = [];
    this.skipNewlines();

    while (!this.check(TOKENS.EOF)) {
      try {
        body.push(this.parseStatement());
      } catch (error) {
        if (!this.isRecoverableParseError(error)) {
          throw error;
        }

        this.errors.push(error);
        if (this.errors.length >= 20) {
          break;
        }
        this.synchronize();
      }
      this.skipNewlines();
    }

    if (this.errors.length > 0) {
      this.errors[0].errors = this.errors;
      throw this.errors[0];
    }

    const firstNode = body[0] || this.peek();
    const endToken = this.peek();
    return AST.Program(body, this.filename, {
      line: firstNode.line,
      column: firstNode.column,
      start: firstNode.start,
      end: endToken.end,
    });
  }

  parseStatement() {
    if (this.match(TOKENS.NEWLINE)) {
      this.skipNewlines();
      return this.parseStatement();
    }

    const token = this.peek();

    switch (token.type) {
      case TOKENS.AMDANI:
        return this.parseImportDeclaration();
      case TOKENS.ROPTANI:
        return this.parseExportDeclaration();
      case TOKENS.DHORI:
        return this.parseVarDeclaration();
      case TOKENS.STHIR:
        return this.parseConstDeclaration();
      case TOKENS.DEKHI:
        return this.parsePrintStatement();
      case TOKENS.JODI:
        return this.parseIfStatement();
      case TOKENS.JOTOKKHON:
        return this.parseWhileStatement();
      case TOKENS.DHORO:
        return this.parseTryStatement();
      case TOKENS.BAR:
        return this.parseForStatement();
      case TOKENS.KAJ:
        return this.parseFunctionDeclaration();
      case TOKENS.ASYNC:
        return this.parseFunctionDeclaration();
      case TOKENS.FEROT:
        return this.parseReturnStatement();
      case TOKENS.BEKKHON:
        return this.parseBreakStatement();
      case TOKENS.CHOLO:
        return this.parseContinueStatement();
      case TOKENS.LEFT_BRACE:
        return this.finishStatement(this.parseBlockStatement());
      case TOKENS.RIGHT_BRACE:
        this.raise(
          token,
          'Unexpected "}" without a matching "{".',
          'Remove the extra "}" or add the missing opening "{".'
        );
        break;
      case TOKENS.NAHOLE:
        this.raise(
          token,
          '"nahole" must follow a "jodi" block.',
          'Use "nahole" immediately after the closing "}" of a "jodi" statement.'
        );
        break;
      case TOKENS.ERROR:
        this.raise(
          token,
          '"error" must follow a "dhoro" block.',
          'Use "error err { ... }" immediately after a "dhoro { ... }" block.'
        );
        break;
      case TOKENS.SHESHE:
        this.raise(
          token,
          '"sheshe" must follow a "dhoro" or "error" block.',
          'Use "sheshe { ... }" after a "dhoro { ... }" or "error err { ... }" block.'
        );
        break;
      case TOKENS.SEMICOLON:
        this.raise(
          token,
          "Semicolons are not supported in BN Script v0.1.",
          "End statements with a newline instead."
        );
        break;
      default:
        if (UNSUPPORTED_STATEMENTS.has(token.type)) {
          this.raise(
            token,
            UNSUPPORTED_STATEMENTS.get(token.type),
          "Use declarations, print, if/else, loops, functions, returns, imports, exports, blocks, calls, and expressions in this alpha."
          );
        }

        if (this.isExpressionStart(token)) {
          return this.parseExpressionStatement();
        }

        this.raise(
          token,
          `Unexpected token "${this.describeToken(token)}".`,
          "Start a statement with amdani, roptani, dhori, sthir, dekhi, jodi, jotokkhon, dhoro, bar, async kaj, kaj, ferot, a block, or an expression."
        );
    }
  }

  parseImportDeclaration() {
    const startToken = this.consume(TOKENS.AMDANI);

    this.consume(
      TOKENS.LEFT_BRACE,
      'Expected "{" after "amdani".',
      'Use: amdani { greet } theke "./utils.bn"'
    );

    const imports = [];
    this.skipNewlines();

    if (this.check(TOKENS.RIGHT_BRACE)) {
      this.raise(
        this.peek(),
        "Expected imported name.",
        'Use one or more imported names, like: amdani { greet } theke "./utils.bn"'
      );
    }

    do {
      this.skipNewlines();
      const nameToken = this.consume(
        TOKENS.IDENTIFIER,
        "Expected imported name.",
        "Use comma-separated imported names inside the braces."
      );
      imports.push(
        AST.ImportSpecifier(
          nameToken.value,
          this.locationFrom(nameToken, nameToken)
        )
      );
      this.skipNewlines();
    } while (this.match(TOKENS.COMMA) && !this.check(TOKENS.RIGHT_BRACE));

    this.consume(
      TOKENS.RIGHT_BRACE,
      'Expected "}" after imported names.',
      'Close the import list before "theke".'
    );

    this.consume(
      TOKENS.THEKE,
      'Expected "theke" after import list.',
      'Use: amdani { greet } theke "./utils.bn"'
    );

    const sourceToken = this.consume(
      TOKENS.STRING,
      "Expected import source string after \"theke\".",
      'Use a string path ending in ".bn", like: "./utils.bn"'
    );
    const source = AST.StringLiteral(
      sourceToken.value,
      this.locationFrom(sourceToken, sourceToken)
    );

    return this.finishStatement(
      AST.ImportDeclaration(
        imports,
        source,
        this.locationFrom(startToken, source)
      )
    );
  }

  parseExportDeclaration() {
    const startToken = this.consume(TOKENS.ROPTANI);
    this.skipNewlines();

    if (this.check(TOKENS.KAJ) || this.check(TOKENS.ASYNC)) {
      const declaration = this.parseFunctionDeclaration();
      return AST.ExportDeclaration(
        declaration,
        this.locationFrom(startToken, declaration)
      );
    }

    if (this.check(TOKENS.DHORI)) {
      const declaration = this.parseVarDeclaration();
      return AST.ExportDeclaration(
        declaration,
        this.locationFrom(startToken, declaration)
      );
    }

    if (this.check(TOKENS.STHIR)) {
      const declaration = this.parseConstDeclaration();
      return AST.ExportDeclaration(
        declaration,
        this.locationFrom(startToken, declaration)
      );
    }

    this.raise(
      this.peek(),
      'Expected "kaj", "async", "dhori", or "sthir" after "roptani".',
      'Use: roptani kaj greet() { ... }, roptani async kaj load() { ... }, roptani dhori x = 1, or roptani sthir y = 2.'
    );
  }

  parseVarDeclaration() {
    const startToken = this.consume(TOKENS.DHORI);
    const nameToken = this.consume(
      TOKENS.IDENTIFIER,
      'Expected variable name after "dhori".',
      'Use: dhori name = "Risat"'
    );
    this.consume(
      TOKENS.EQUAL,
      'Expected "=" after variable name.',
      'Use: dhori name = "Risat"'
    );
    const initializer = this.parseExpression('Expected initializer after "=".');

    return this.finishStatement(
      AST.VarDeclaration(
        nameToken.value,
        initializer,
        this.locationFrom(startToken, initializer)
      )
    );
  }

  parseConstDeclaration() {
    const startToken = this.consume(TOKENS.STHIR);
    const nameToken = this.consume(
      TOKENS.IDENTIFIER,
      'Expected constant name after "sthir".',
      "Use: sthir NAME = value"
    );
    this.consume(
      TOKENS.EQUAL,
      'Expected "=" after constant name.',
      "Use: sthir NAME = value"
    );
    const initializer = this.parseExpression('Expected initializer after "=".');

    return this.finishStatement(
      AST.ConstDeclaration(
        nameToken.value,
        initializer,
        this.locationFrom(startToken, initializer)
      )
    );
  }

  parsePrintStatement() {
    const startToken = this.consume(TOKENS.DEKHI);
    const args = [
      this.parseExpression('Expected expression after "dekhi".'),
    ];

    while (this.match(TOKENS.COMMA)) {
      this.skipNewlines();
      args.push(
        this.parseExpression('Expected expression after "," in "dekhi" statement.')
      );
    }

    return this.finishStatement(
      AST.PrintStatement(args, this.locationFrom(startToken, args[args.length - 1]))
    );
  }

  parseIfStatement() {
    const startToken = this.consume(TOKENS.JODI);
    const condition = this.parseExpression('Expected condition after "jodi".');
    const consequent = this.parseRequiredBlock('"jodi" statement');
    const alternates = [];
    let elseBlock = null;
    let newlinesAfterBlock = this.skipNewlines();
    let lastBlock = consequent;

    while (this.match(TOKENS.NAHOLE)) {
      const elseToken = this.previous();

      if (this.match(TOKENS.JODI)) {
        const alternateCondition = this.parseExpression(
          'Expected condition after "nahole jodi".'
        );
        const alternateConsequent = this.parseRequiredBlock('"nahole jodi" branch');
        alternates.push({
          condition: alternateCondition,
          consequent: alternateConsequent,
          ...this.locationFrom(elseToken, alternateConsequent),
        });
        lastBlock = alternateConsequent;
        newlinesAfterBlock = this.skipNewlines();
        continue;
      }

      elseBlock = this.parseRequiredBlock('"nahole" branch');
      lastBlock = elseBlock;
      newlinesAfterBlock = this.skipNewlines();
      break;
    }

    this.ensureCompoundStatementBoundary(newlinesAfterBlock);

    return AST.IfStatement(
      condition,
      consequent,
      alternates,
      elseBlock,
      this.locationFrom(startToken, lastBlock)
    );
  }

  parseWhileStatement() {
    const startToken = this.consume(TOKENS.JOTOKKHON);
    const condition = this.parseExpression('Expected condition after "jotokkhon".');
    const body = this.parseRequiredBlock('"jotokkhon" loop');
    const newlinesAfterBlock = this.skipNewlines();
    this.ensureCompoundStatementBoundary(newlinesAfterBlock);

    return AST.WhileStatement(
      condition,
      body,
      this.locationFrom(startToken, body)
    );
  }

  parseTryStatement() {
    const startToken = this.consume(TOKENS.DHORO);
    const tryBlock = this.parseRequiredBlock('"dhoro" try');
    let newlinesAfterBlock = this.skipNewlines();
    let catchParam = null;
    let catchBlock = null;
    let finallyBlock = null;
    let lastBlock = tryBlock;

    if (this.match(TOKENS.ERROR)) {
      const errorToken = this.previous();
      const paramToken = this.consume(
        TOKENS.IDENTIFIER,
        'Expected catch variable after "error".',
        'Use: dhoro { ... } error err { ... }'
      );
      catchParam = AST.Parameter(
        paramToken.value,
        this.locationFrom(paramToken, paramToken)
      );
      catchBlock = this.parseRequiredBlock('"error" catch');
      lastBlock = catchBlock;
      newlinesAfterBlock = this.skipNewlines();

      if (!newlinesAfterBlock && !this.check(TOKENS.SHESHE)) {
        this.ensureCompoundStatementBoundary(newlinesAfterBlock);
      }

      catchParam.errorKeyword = this.locationFrom(errorToken, errorToken);
    }

    if (this.match(TOKENS.SHESHE)) {
      finallyBlock = this.parseRequiredBlock('"sheshe" finally');
      lastBlock = finallyBlock;
      newlinesAfterBlock = this.skipNewlines();
    }

    if (!catchBlock && !finallyBlock) {
      this.raise(
        this.peek(),
        '"dhoro" must include "error" or "sheshe".',
        'Use: dhoro { ... } error err { ... }, dhoro { ... } sheshe { ... }, or both.'
      );
    }

    this.ensureCompoundStatementBoundary(newlinesAfterBlock);

    return AST.TryStatement(
      tryBlock,
      catchParam,
      catchBlock,
      finallyBlock,
      this.locationFrom(startToken, lastBlock)
    );
  }

  parseForStatement() {
    const startToken = this.consume(TOKENS.BAR);
    const iteratorToken = this.consume(
      TOKENS.IDENTIFIER,
      'Expected iterator name after "bar".',
      'Use: bar i = 0 theke 5 { dekhi i } or bar item ekti names { dekhi item }'
    );

    if (this.match(TOKENS.EQUAL)) {
      return this.parseRangeForStatement(startToken, iteratorToken);
    }

    if (this.match(TOKENS.EKTI)) {
      return this.parseForEachStatement(startToken, iteratorToken);
    }

    this.raise(
      this.peek(),
      'Expected "=" or "ekti" after "bar" iterator.',
      'Use "bar i = 0 theke 5 { ... }" or "bar item ekti names { ... }".'
    );
  }

  parseRangeForStatement(startToken, iteratorToken) {
    this.skipNewlines();
    const start = this.parseExpression('Expected start expression after "=".');
    this.skipNewlines();
    this.consume(
      TOKENS.THEKE,
      'Expected "theke" after range loop start expression.',
      'Use: bar i = 0 theke 5 { dekhi i }'
    );
    this.skipNewlines();
    const end = this.parseExpression('Expected end expression after "theke".');
    const body = this.parseRequiredBlock('"bar" range loop');
    const newlinesAfterBlock = this.skipNewlines();
    this.ensureCompoundStatementBoundary(newlinesAfterBlock);

    return AST.ForLoop(
      iteratorToken.value,
      start,
      end,
      body,
      this.locationFrom(startToken, body)
    );
  }

  parseForEachStatement(startToken, iteratorToken) {
    this.skipNewlines();
    const iterable = this.parseExpression('Expected iterable expression after "ekti".');
    const body = this.parseRequiredBlock('"bar" foreach loop');
    const newlinesAfterBlock = this.skipNewlines();
    this.ensureCompoundStatementBoundary(newlinesAfterBlock);

    return AST.ForEachLoop(
      iteratorToken.value,
      iterable,
      body,
      this.locationFrom(startToken, body)
    );
  }

  parseFunctionDeclaration() {
    let startToken = this.peek();
    let isAsync = false;

    if (this.match(TOKENS.ASYNC)) {
      startToken = this.previous();
      isAsync = true;
      this.consume(
        TOKENS.KAJ,
        'Expected "kaj" after "async".',
        'Use: async kaj load() { ... }'
      );
    } else {
      startToken = this.consume(TOKENS.KAJ);
    }

    const nameToken = this.consume(
      TOKENS.IDENTIFIER,
      'Expected function name after "kaj".',
      "Use: kaj greet(name) { ferot name }"
    );

    this.consume(
      TOKENS.LEFT_PAREN,
      'Expected "(" after function name.',
      "Add parentheses after the function name, even when there are no parameters."
    );

    const params = [];
    this.skipNewlines();

    if (!this.check(TOKENS.RIGHT_PAREN)) {
      do {
        this.skipNewlines();
        const paramToken = this.consume(
          TOKENS.IDENTIFIER,
          "Expected parameter name.",
          "Use comma-separated parameter names, like: kaj add(a, b) { }"
        );

        if (this.check(TOKENS.EQUAL)) {
          this.raise(
            this.peek(),
            "Default parameters are not supported in this compiler stage.",
            "Use plain parameter names without default values."
          );
        }

        params.push(
          AST.Parameter(
            paramToken.value,
            this.locationFrom(paramToken, paramToken)
          )
        );
        this.skipNewlines();
      } while (this.match(TOKENS.COMMA));
    }

    const closeToken = this.consume(
      TOKENS.RIGHT_PAREN,
      'Expected ")" after function parameters.',
      'Add ")" before the function body.'
    );

    const body = this.parseRequiredBlock('"kaj" function');
    const newlinesAfterBlock = this.skipNewlines();
    this.ensureCompoundStatementBoundary(newlinesAfterBlock);

    return AST.FunctionDeclaration(
      nameToken.value,
      params,
      body,
      this.locationFrom(startToken, body || closeToken),
      { isAsync }
    );
  }

  parseReturnStatement() {
    const startToken = this.consume(TOKENS.FEROT);
    let value = null;
    let endNode = startToken;

    if (!this.isExpressionBoundary(this.peek())) {
      value = this.parseExpression('Expected expression after "ferot".');
      endNode = value;
    }

    return this.finishStatement(
      AST.ReturnStatement(value, this.locationFrom(startToken, endNode))
    );
  }

  parseBreakStatement() {
    const startToken = this.consume(TOKENS.BEKKHON);
    return this.finishStatement(
      AST.BreakStatement(this.locationFrom(startToken, startToken))
    );
  }

  parseContinueStatement() {
    const startToken = this.consume(TOKENS.CHOLO);
    return this.finishStatement(
      AST.ContinueStatement(this.locationFrom(startToken, startToken))
    );
  }

  parseBlockStatement() {
    return this.parseBlock();
  }

  parseBlock() {
    const openToken = this.consume(TOKENS.LEFT_BRACE);
    const body = [];
    this.skipNewlines();

    while (!this.check(TOKENS.RIGHT_BRACE) && !this.check(TOKENS.EOF)) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (this.check(TOKENS.EOF)) {
      this.raise(
        this.peek(),
        `Expected "}" to close block started at line ${openToken.line}.`,
        'Add a closing "}" for this block.'
      );
    }

    const closeToken = this.consume(TOKENS.RIGHT_BRACE);
    return AST.BlockStatement(body, this.locationFrom(openToken, closeToken));
  }

  parseExpressionStatement() {
    const expression = this.parseExpression();
    return this.finishStatement(
      AST.ExpressionStatement(expression, this.locationFrom(expression, expression))
    );
  }

  parseExpression(message = "Expected expression.") {
    if (this.isExpressionBoundary(this.peek())) {
      this.raise(this.peek(), message, "Add an expression before the statement ends.");
    }
    return this.parseAssignmentExpression();
  }

  parseAssignmentExpression() {
    const target = this.parseBinaryExpression(1);

    if (!this.match(...ASSIGNMENT_OPERATORS)) {
      return target;
    }

    const operatorToken = this.previous();

    if (!this.isAssignmentTarget(target)) {
      this.raise(
        operatorToken,
        "Invalid assignment target.",
        "Assign to an identifier, member, or index target, like: count = 1, user.name = value, or names[0] = value."
      );
    }

    this.skipNewlines();

    if (this.isExpressionBoundary(this.peek())) {
      this.raise(
        this.peek(),
        `Expected expression after assignment operator "${operatorToken.value}".`,
        "Add the value to assign on the right-hand side."
      );
    }

    const value = this.parseAssignmentExpression();
    return AST.AssignmentExpression(
      operatorToken.value,
      target,
      value,
      this.locationFrom(target, value)
    );
  }

  parseBinaryExpression(minPrecedence) {
    let left = this.parseUnaryExpression();

    while (true) {
      const operatorToken = this.peek();
      const precedence = BINARY_PRECEDENCE.get(operatorToken.type);

      if (precedence === undefined || precedence < minPrecedence) {
        break;
      }

      this.advance();
      this.skipNewlines();

      if (this.isExpressionBoundary(this.peek())) {
        this.raise(
          this.peek(),
          `Expected expression after operator "${operatorToken.value}".`,
          "Add the right-hand side expression after the operator."
        );
      }

      const nextMinPrecedence =
        operatorToken.type === TOKENS.STAR_STAR ? precedence : precedence + 1;
      const right = this.parseBinaryExpression(nextMinPrecedence);
      left = AST.BinaryExpression(
        operatorToken.value,
        left,
        right,
        this.locationFrom(left, right)
      );
    }

    return left;
  }

  parseUnaryExpression() {
    if (this.match(TOKENS.ABR)) {
      const awaitToken = this.previous();
      this.skipNewlines();
      const argument = this.parseUnaryExpression();
      return AST.AwaitExpression(
        argument,
        this.locationFrom(awaitToken, argument)
      );
    }

    if (this.match(TOKENS.NA, TOKENS.MINUS)) {
      const operatorToken = this.previous();
      this.skipNewlines();
      const operand = this.parseUnaryExpression();
      return AST.UnaryExpression(
        operatorToken.value,
        operand,
        this.locationFrom(operatorToken, operand)
      );
    }

    return this.parsePostfixExpression();
  }

  parsePostfixExpression() {
    let expression = this.parsePrimaryExpression();

    while (true) {
      if (this.match(TOKENS.LEFT_PAREN)) {
        const args = [];
        this.skipNewlines();

        if (!this.check(TOKENS.RIGHT_PAREN)) {
          do {
            this.skipNewlines();
            args.push(
              this.parseExpression("Expected argument in function call.")
            );
            this.skipNewlines();
          } while (this.match(TOKENS.COMMA));
        }

        const closeToken = this.consume(
          TOKENS.RIGHT_PAREN,
          'Expected ")" after function call arguments.',
          'Add ")" to close the function call.'
        );

        expression = AST.CallExpression(
          expression,
          args,
          this.locationFrom(expression, closeToken)
        );
        continue;
      }

      if (this.match(TOKENS.DOT)) {
        const dotToken = this.previous();
        const propertyToken = this.consume(
          TOKENS.IDENTIFIER,
          'Expected property name after ".".',
          "Use member access like: user.name"
        );

        expression = AST.MemberExpression(
          expression,
          propertyToken.value,
          false,
          this.locationFrom(expression, propertyToken)
        );
        continue;
      }

      if (this.match(TOKENS.LEFT_BRACKET)) {
        const openToken = this.previous();

        if (this.check(TOKENS.RIGHT_BRACKET)) {
          this.raise(
            this.peek(),
            'Expected expression inside "[]".',
            "Place an index expression between the brackets."
          );
        }

        const property = this.parseExpression("Expected index expression.");
        const closeToken = this.consume(
          TOKENS.RIGHT_BRACKET,
          'Expected "]" after index expression.',
          'Add "]" to close the index access.'
        );

        expression = AST.MemberExpression(
          expression,
          property,
          true,
          this.locationFrom(expression, closeToken)
        );
        continue;
      }

      break;
    }

    return expression;
  }

  parsePrimaryExpression() {
    if (this.match(TOKENS.NUMBER)) {
      const token = this.previous();
      return AST.NumberLiteral(
        Number(token.value.replaceAll("_", "")),
        token.value,
        this.locationFrom(token, token)
      );
    }

    if (this.match(TOKENS.STRING)) {
      const token = this.previous();
      return AST.StringLiteral(
        token.value,
        this.locationFrom(token, token),
        token.hasInterpolation === true
      );
    }

    if (this.match(TOKENS.SOTTI)) {
      const token = this.previous();
      return AST.BooleanLiteral(true, this.locationFrom(token, token));
    }

    if (this.match(TOKENS.MITTHA)) {
      const token = this.previous();
      return AST.BooleanLiteral(false, this.locationFrom(token, token));
    }

    if (this.match(TOKENS.KHALI)) {
      const token = this.previous();
      return AST.NullLiteral(this.locationFrom(token, token));
    }

    if (this.match(TOKENS.IDENTIFIER)) {
      const token = this.previous();
      return AST.Identifier(token.value, this.locationFrom(token, token));
    }

    if (this.match(TOKENS.LEFT_PAREN)) {
      const openToken = this.previous();
      if (this.check(TOKENS.RIGHT_PAREN)) {
        this.raise(
          this.peek(),
          'Expected expression inside "()".',
          "Place an expression between the parentheses."
        );
      }

      const expression = this.parseExpression();
      const closeToken = this.consume(
        TOKENS.RIGHT_PAREN,
        'Expected ")" after grouped expression.',
        'Add ")" to close the grouped expression.'
      );
      return {
        ...expression,
        start: openToken.start,
        end: closeToken.end,
        line: openToken.line,
        column: openToken.column,
      };
    }

    if (this.check(TOKENS.LEFT_BRACKET)) {
      return this.parseArrayLiteral();
    }

    if (this.check(TOKENS.LEFT_BRACE)) {
      return this.parseObjectLiteral();
    }

    const token = this.peek();
    this.raise(
      token,
      `Expected expression, but found "${this.describeToken(token)}".`,
      "Use a number, string, boolean, khali, identifier, unary operator, or grouped expression."
    );
  }

  parseArrayLiteral() {
    const openToken = this.consume(TOKENS.LEFT_BRACKET);
    const elements = [];
    this.skipNewlines();

    if (!this.check(TOKENS.RIGHT_BRACKET)) {
      do {
        this.skipNewlines();
        elements.push(this.parseExpression("Expected array element."));
        this.skipNewlines();
      } while (this.match(TOKENS.COMMA) && !this.check(TOKENS.RIGHT_BRACKET));
    }

    const closeToken = this.consume(
      TOKENS.RIGHT_BRACKET,
      'Expected "]" after array literal.',
      'Add "]" to close the array literal.'
    );

    return AST.ArrayLiteral(elements, this.locationFrom(openToken, closeToken));
  }

  parseObjectLiteral() {
    const openToken = this.consume(TOKENS.LEFT_BRACE);
    const properties = [];
    this.skipNewlines();

    if (!this.check(TOKENS.RIGHT_BRACE)) {
      do {
        this.skipNewlines();
        const keyToken = this.consumeObjectKey();
        this.consume(
          TOKENS.COLON,
          'Expected ":" after object property name.',
          'Use object properties like: name: "Risat"'
        );
        this.skipNewlines();
        const value = this.parseExpression("Expected object property value.");
        properties.push(
          AST.ObjectProperty(
            keyToken.value,
            value,
            this.locationFrom(keyToken, value)
          )
        );
        this.skipNewlines();
      } while (this.match(TOKENS.COMMA) && !this.check(TOKENS.RIGHT_BRACE));
    }

    const closeToken = this.consume(
      TOKENS.RIGHT_BRACE,
      'Expected "}" after object literal.',
      'Add "}" to close the object literal.'
    );

    return AST.ObjectLiteral(properties, this.locationFrom(openToken, closeToken));
  }

  consumeObjectKey() {
    if (this.match(TOKENS.IDENTIFIER, TOKENS.STRING)) {
      return this.previous();
    }

    this.raise(
      this.peek(),
      "Expected object property name.",
      "Use an identifier or string property name before ':'."
    );
  }

  parseRequiredBlock(context) {
    if (!this.check(TOKENS.LEFT_BRACE)) {
      this.raise(
        this.peek(),
        `Expected "{" to start ${context} block.`,
        'Add "{" after the condition, then close the block with "}".'
      );
    }

    return this.parseBlock();
  }

  finishStatement(node) {
    if (this.match(TOKENS.NEWLINE)) {
      this.skipNewlines();
      return node;
    }

    if (this.check(TOKENS.EOF) || this.check(TOKENS.RIGHT_BRACE)) {
      return node;
    }

    const token = this.peek();

    if (token.type === TOKENS.SEMICOLON) {
      this.raise(
        token,
        "Semicolons are not supported in BN Script v0.1.",
        "End statements with a newline instead."
      );
    }

    if (ASSIGNMENT_OPERATORS.has(token.type)) {
      this.raise(
        token,
        `Unexpected assignment operator "${token.value}".`,
        "Place the assignment target before the operator, like: count = count + 1"
      );
    }

    if (token.type === TOKENS.LEFT_PAREN) {
      this.raise(
        token,
        'Unexpected "(" after statement.',
        "Write function calls directly after a callee expression, like: greet(name)"
      );
    }

    if (token.type === TOKENS.DOT || token.type === TOKENS.LEFT_BRACKET) {
      this.raise(
        token,
        `Unexpected "${this.describeToken(token)}" after statement.`,
        "Place member or index access directly after an expression, like: user.name or names[0]."
      );
    }

    this.raise(
      token,
      `Expected newline after statement, but found "${this.describeToken(token)}".`,
      "Put the next statement on a new line."
    );
  }

  ensureCompoundStatementBoundary(newlinesAfterBlock) {
    if (
      newlinesAfterBlock > 0 ||
      this.check(TOKENS.EOF) ||
      this.check(TOKENS.RIGHT_BRACE)
    ) {
      return;
    }

    this.raise(
      this.peek(),
      `Expected newline after statement, but found "${this.describeToken(this.peek())}".`,
      "Put the next statement on a new line."
    );
  }

  skipNewlines() {
    let count = 0;
    while (this.match(TOKENS.NEWLINE)) {
      count += 1;
    }
    return count;
  }

  synchronize() {
    // Recovery discards the rest of the broken statement so leftover tokens
    // do not become phantom expression statements.
    while (!this.check(TOKENS.EOF)) {
      if (this.check(TOKENS.RIGHT_BRACE)) {
        this.advance();
        return;
      }

      if (this.match(TOKENS.NEWLINE)) {
        return;
      }

      this.advance();
    }
  }

  consume(type, message, suggestion) {
    if (this.check(type)) {
      return this.advance();
    }

    this.raise(this.peek(), message || `Expected ${type}.`, suggestion);
  }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    return this.peek().type === type;
  }

  advance() {
    if (!this.check(TOKENS.EOF)) {
      this.index += 1;
    }
    return this.previous();
  }

  previous() {
    return this.tokens[this.index - 1];
  }

  peek(offset = 0) {
    const index = Math.min(this.index + offset, this.tokens.length - 1);
    return this.tokens[index];
  }

  isExpressionStart(token) {
    return EXPRESSION_STARTS.has(token.type);
  }

  isExpressionBoundary(token) {
    return (
      token.type === TOKENS.NEWLINE ||
      token.type === TOKENS.EOF ||
      token.type === TOKENS.RIGHT_BRACE ||
      token.type === TOKENS.COMMA
    );
  }

  locationFrom(start, end) {
    return {
      line: start.line,
      column: start.column,
      start: start.start,
      end: end.end,
    };
  }

  describeToken(token) {
    return token.value || token.type;
  }

  isAssignmentTarget(node) {
    return node?.type === "Identifier" || node?.type === "MemberExpression";
  }

  sourceLine(line) {
    return this.sourceLines[line - 1];
  }

  isRecoverableParseError(error) {
    return error && error.name === "BNError" && error.category === "ParseError";
  }

  raise(token, message, suggestion) {
    throw createError({
      category: "ParseError",
      message,
      filename: this.filename,
      line: token.line,
      column: token.column,
      sourceLine: this.sourceLine(token.line),
      suggestion,
    });
  }
}

export function parse(tokens, options = {}) {
  return new Parser(tokens, options).parseProgram();
}
