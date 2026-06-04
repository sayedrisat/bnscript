import test from "node:test";
import assert from "node:assert";
import { tokenize } from "../src/lexer.js";
import { parse } from "../src/parser.js";

function parseSource(source) {
  return parse(tokenize(source, "test.bn"), {
    filename: "test.bn",
    source,
  });
}

function firstStatement(source) {
  return parseSource(source).body[0];
}

test("parser: variable declaration", () => {
  const statement = firstStatement("dhori name = \"Risat\"");

  assert.strictEqual(statement.type, "VarDeclaration");
  assert.strictEqual(statement.name, "name");
  assert.strictEqual(statement.initializer.type, "StringLiteral");
  assert.strictEqual(statement.initializer.value, "Risat");
});

test("parser: constant declaration", () => {
  const statement = firstStatement("sthir PI = 3.14");

  assert.strictEqual(statement.type, "ConstDeclaration");
  assert.strictEqual(statement.name, "PI");
  assert.strictEqual(statement.initializer.type, "NumberLiteral");
  assert.strictEqual(statement.initializer.value, 3.14);
});

test("parser: print statement", () => {
  const statement = firstStatement("dekhi name, 42");

  assert.strictEqual(statement.type, "PrintStatement");
  assert.strictEqual(statement.arguments.length, 2);
  assert.strictEqual(statement.arguments[0].type, "Identifier");
  assert.strictEqual(statement.arguments[1].type, "NumberLiteral");
});

test("parser: number literal", () => {
  const expression = firstStatement("42").expression;

  assert.strictEqual(expression.type, "NumberLiteral");
  assert.strictEqual(expression.value, 42);
  assert.strictEqual(expression.raw, "42");
});

test("parser: string literal", () => {
  const expression = firstStatement("\"hello\"").expression;

  assert.strictEqual(expression.type, "StringLiteral");
  assert.strictEqual(expression.value, "hello");
  assert.strictEqual(expression.hasInterpolation, false);
});

test("parser: boolean literal", () => {
  assert.strictEqual(firstStatement("sotti").expression.value, true);
  assert.strictEqual(firstStatement("mittha").expression.value, false);
});

test("parser: null literal", () => {
  const expression = firstStatement("khali").expression;

  assert.strictEqual(expression.type, "NullLiteral");
  assert.strictEqual(expression.value, null);
});

test("parser: identifier expression", () => {
  const expression = firstStatement("user_name").expression;

  assert.strictEqual(expression.type, "Identifier");
  assert.strictEqual(expression.name, "user_name");
});

test("parser: binary expression", () => {
  const expression = firstStatement("1 + 2").expression;

  assert.strictEqual(expression.type, "BinaryExpression");
  assert.strictEqual(expression.operator, "+");
  assert.strictEqual(expression.left.value, 1);
  assert.strictEqual(expression.right.value, 2);
});

test("parser: operator precedence", () => {
  const expression = firstStatement("1 + 2 * 3").expression;

  assert.strictEqual(expression.operator, "+");
  assert.strictEqual(expression.left.value, 1);
  assert.strictEqual(expression.right.operator, "*");
  assert.strictEqual(expression.right.left.value, 2);
  assert.strictEqual(expression.right.right.value, 3);
});

test("parser: exponent operator is right-associative", () => {
  const expression = firstStatement("2 ** 3 ** 4").expression;

  assert.strictEqual(expression.operator, "**");
  assert.strictEqual(expression.left.value, 2);
  assert.strictEqual(expression.right.operator, "**");
  assert.strictEqual(expression.right.left.value, 3);
  assert.strictEqual(expression.right.right.value, 4);
});

test("parser: grouped expression", () => {
  const expression = firstStatement("(1 + 2) * 3").expression;

  assert.strictEqual(expression.operator, "*");
  assert.strictEqual(expression.left.operator, "+");
  assert.strictEqual(expression.left.left.value, 1);
  assert.strictEqual(expression.left.right.value, 2);
  assert.strictEqual(expression.right.value, 3);
});

test("parser: deeply nested grouped expressions", () => {
  const expression = firstStatement("(((((1 + 2)))))").expression;

  assert.strictEqual(expression.type, "BinaryExpression");
  assert.strictEqual(expression.operator, "+");
  assert.strictEqual(expression.left.value, 1);
  assert.strictEqual(expression.right.value, 2);
  assert.strictEqual(expression.line, 1);
  assert.strictEqual(expression.column, 1);
});

test("parser: unary expression", () => {
  const expression = firstStatement("na sotti").expression;

  assert.strictEqual(expression.type, "UnaryExpression");
  assert.strictEqual(expression.operator, "na");
  assert.strictEqual(expression.operand.type, "BooleanLiteral");
});

test("parser: if statement", () => {
  const statement = firstStatement(`jodi age >= 18 {
  dekhi "Adult"
}`);

  assert.strictEqual(statement.type, "IfStatement");
  assert.strictEqual(statement.condition.operator, ">=");
  assert.strictEqual(statement.consequent.type, "BlockStatement");
  assert.strictEqual(statement.consequent.body[0].type, "PrintStatement");
  assert.strictEqual(statement.elseBlock, null);
});

test("parser: if/else statement", () => {
  const statement = firstStatement(`jodi adult {
  dekhi "Adult"
} nahole {
  dekhi "Minor"
}`);

  assert.strictEqual(statement.type, "IfStatement");
  assert.strictEqual(statement.condition.name, "adult");
  assert.strictEqual(statement.elseBlock.type, "BlockStatement");
  assert.strictEqual(statement.elseBlock.body[0].arguments[0].value, "Minor");
});

test("parser: else-if chain", () => {
  const statement = firstStatement(`jodi score >= 90 {
  dekhi "A"
} nahole jodi score >= 80 {
  dekhi "B"
} nahole jodi score >= 70 {
  dekhi "C"
} nahole {
  dekhi "F"
}`);

  assert.strictEqual(statement.type, "IfStatement");
  assert.strictEqual(statement.alternates.length, 2);
  assert.strictEqual(statement.alternates[0].condition.operator, ">=");
  assert.strictEqual(statement.alternates[0].condition.right.value, 80);
  assert.strictEqual(statement.alternates[0].consequent.body[0].arguments[0].value, "B");
  assert.strictEqual(statement.alternates[1].condition.operator, ">=");
  assert.strictEqual(statement.alternates[1].condition.right.value, 70);
  assert.strictEqual(statement.alternates[1].consequent.body[0].arguments[0].value, "C");
  assert.strictEqual(statement.elseBlock.body[0].arguments[0].value, "F");
});

test("parser: nested block", () => {
  const statement = firstStatement(`{
  {
    dekhi "inner"
  }
}`);

  assert.strictEqual(statement.type, "BlockStatement");
  assert.strictEqual(statement.body[0].type, "BlockStatement");
  assert.strictEqual(statement.body[0].body[0].type, "PrintStatement");
});

test("parser: expression statement", () => {
  const statement = firstStatement("count + 1");

  assert.strictEqual(statement.type, "ExpressionStatement");
  assert.strictEqual(statement.expression.type, "BinaryExpression");
  assert.strictEqual(statement.expression.left.name, "count");
});

test("parser: missing identifier after dhori", () => {
  assert.throws(
    () => parseSource("dhori = 1"),
    (err) =>
      err.name === "BNError" &&
      err.category === "ParseError" &&
      err.message.includes('Expected variable name after "dhori"')
  );
});

test("parser: error aggregation recovers at the next statement", () => {
  assert.throws(
    () =>
      parseSource(`dhori = 1 +
sthir = 2`),
    (err) => {
      assert.strictEqual(err.name, "BNError");
      assert.strictEqual(err.category, "ParseError");
      assert.ok(Array.isArray(err.errors));
      assert.strictEqual(err.errors.length, 2);
      assert.strictEqual(err.errors[0].line, 1);
      assert.strictEqual(err.errors[1].line, 2);
      assert.ok(err.errors[0].message.includes('Expected variable name after "dhori"'));
      assert.ok(err.errors[1].message.includes('Expected constant name after "sthir"'));
      return true;
    }
  );
});

test("parser: missing closing brace", () => {
  assert.throws(
    () =>
      parseSource(`jodi ready {
  dekhi ready`),
    (err) =>
      err.name === "BNError" &&
      err.category === "ParseError" &&
      err.message.includes('Expected "}" to close block')
  );
});
