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

test("parser: function declaration", () => {
  const statement = firstStatement(`kaj greet(name) {
  ferot name
}`);

  assert.strictEqual(statement.type, "FunctionDeclaration");
  assert.strictEqual(statement.name, "greet");
  assert.strictEqual(statement.params.length, 1);
  assert.strictEqual(statement.params[0].name, "name");
  assert.strictEqual(statement.body.type, "BlockStatement");
  assert.strictEqual(statement.body.body[0].type, "ReturnStatement");
});

test("parser: function with multiple params", () => {
  const statement = firstStatement(`kaj add(a, b, c) {
  ferot a + b + c
}`);

  assert.strictEqual(statement.type, "FunctionDeclaration");
  assert.deepStrictEqual(
    statement.params.map((param) => param.name),
    ["a", "b", "c"]
  );
});

test("parser: return statement", () => {
  const statement = firstStatement("ferot 42");

  assert.strictEqual(statement.type, "ReturnStatement");
  assert.strictEqual(statement.value.type, "NumberLiteral");
  assert.strictEqual(statement.value.value, 42);
});

test("parser: function call", () => {
  const expression = firstStatement('greet("Risat")').expression;

  assert.strictEqual(expression.type, "CallExpression");
  assert.strictEqual(expression.callee.type, "Identifier");
  assert.strictEqual(expression.callee.name, "greet");
  assert.strictEqual(expression.arguments.length, 1);
  assert.strictEqual(expression.arguments[0].value, "Risat");
});

test("parser: nested function body", () => {
  const statement = firstStatement(`kaj outer(name) {
  kaj inner(value) {
    ferot value
  }
  ferot inner(name)
}`);

  assert.strictEqual(statement.type, "FunctionDeclaration");
  assert.strictEqual(statement.body.body[0].type, "FunctionDeclaration");
  assert.strictEqual(statement.body.body[0].name, "inner");
  assert.strictEqual(statement.body.body[1].type, "ReturnStatement");
  assert.strictEqual(statement.body.body[1].value.type, "CallExpression");
});

test("parser: simple assignment", () => {
  const expression = firstStatement("count = count + 1").expression;

  assert.strictEqual(expression.type, "AssignmentExpression");
  assert.strictEqual(expression.operator, "=");
  assert.strictEqual(expression.target.type, "Identifier");
  assert.strictEqual(expression.target.name, "count");
  assert.strictEqual(expression.value.type, "BinaryExpression");
  assert.strictEqual(expression.value.operator, "+");
});

test("parser: compound assignments", () => {
  for (const operator of ["+=", "-=", "*=", "/="]) {
    const expression = firstStatement(`count ${operator} 2`).expression;

    assert.strictEqual(expression.type, "AssignmentExpression");
    assert.strictEqual(expression.operator, operator);
    assert.strictEqual(expression.target.name, "count");
    assert.strictEqual(expression.value.value, 2);
  }
});

test("parser: assignment precedence", () => {
  const expression = firstStatement("count = count + 1 * 2").expression;

  assert.strictEqual(expression.type, "AssignmentExpression");
  assert.strictEqual(expression.value.operator, "+");
  assert.strictEqual(expression.value.left.name, "count");
  assert.strictEqual(expression.value.right.operator, "*");
});

test("parser: invalid assignment target", () => {
  assert.throws(
    () => firstStatement("5 = x"),
    (err) =>
      err.name === "BNError" &&
      err.category === "ParseError" &&
      err.message.includes("Invalid assignment target")
  );

  assert.throws(
    () => firstStatement('"hello" = x'),
    (err) =>
      err.name === "BNError" &&
      err.category === "ParseError" &&
      err.message.includes("Invalid assignment target")
  );

  assert.throws(
    () => firstStatement("greet() = x"),
    (err) =>
      err.name === "BNError" &&
      err.category === "ParseError" &&
      err.message.includes("Invalid assignment target")
  );
});

test("parser: while loop parses", () => {
  const statement = firstStatement(`jotokkhon i < 5 {
  dekhi i
}`);

  assert.strictEqual(statement.type, "WhileStatement");
  assert.strictEqual(statement.condition.type, "BinaryExpression");
  assert.strictEqual(statement.condition.operator, "<");
  assert.strictEqual(statement.body.type, "BlockStatement");
});

test("parser: while loop body parses", () => {
  const statement = firstStatement(`jotokkhon i < 3 {
  dekhi i
  i = i + 1
}`);

  assert.strictEqual(statement.body.body.length, 2);
  assert.strictEqual(statement.body.body[0].type, "PrintStatement");
  assert.strictEqual(statement.body.body[1].type, "ExpressionStatement");
  assert.strictEqual(statement.body.body[1].expression.type, "AssignmentExpression");
});

test("parser: missing while block", () => {
  assert.throws(
    () => parseSource("jotokkhon i < 5"),
    (err) =>
      err.name === "BNError" &&
      err.category === "ParseError" &&
      err.message.includes('Expected "{" to start "jotokkhon" loop block')
  );
});

test("parser: array literals", () => {
  const empty = firstStatement("dhori items = []").initializer;
  const single = firstStatement("dhori items = [1]").initializer;
  const multiple = firstStatement("dhori items = [1, 2, 3]").initializer;
  const strings = firstStatement('dhori names = ["a", "b"]').initializer;

  assert.strictEqual(empty.type, "ArrayLiteral");
  assert.strictEqual(empty.elements.length, 0);
  assert.strictEqual(single.elements[0].value, 1);
  assert.strictEqual(multiple.elements.length, 3);
  assert.strictEqual(strings.elements[1].value, "b");
});

test("parser: nested arrays", () => {
  const expression = firstStatement("dhori matrix = [[1], [2, 3]]").initializer;

  assert.strictEqual(expression.type, "ArrayLiteral");
  assert.strictEqual(expression.elements[0].type, "ArrayLiteral");
  assert.strictEqual(expression.elements[1].elements[1].value, 3);
});

test("parser: object literals", () => {
  const expression = firstStatement(`dhori user = {
  name: "Risat",
  age: 25
}`).initializer;

  assert.strictEqual(expression.type, "ObjectLiteral");
  assert.strictEqual(expression.properties.length, 2);
  assert.strictEqual(expression.properties[0].key, "name");
  assert.strictEqual(expression.properties[0].value.value, "Risat");
  assert.strictEqual(expression.properties[1].key, "age");
  assert.strictEqual(expression.properties[1].value.value, 25);
});

test("parser: nested objects", () => {
  const expression = firstStatement(`dhori user = {
  profile: {
    city: "Dhaka"
  }
}`).initializer;

  assert.strictEqual(expression.type, "ObjectLiteral");
  assert.strictEqual(expression.properties[0].value.type, "ObjectLiteral");
  assert.strictEqual(expression.properties[0].value.properties[0].key, "city");
});

test("parser: member access", () => {
  const expression = firstStatement("user.name").expression;

  assert.strictEqual(expression.type, "MemberExpression");
  assert.strictEqual(expression.object.name, "user");
  assert.strictEqual(expression.property, "name");
  assert.strictEqual(expression.computed, false);
});

test("parser: chained member access", () => {
  const expression = firstStatement("user.profile.city").expression;

  assert.strictEqual(expression.type, "MemberExpression");
  assert.strictEqual(expression.property, "city");
  assert.strictEqual(expression.object.type, "MemberExpression");
  assert.strictEqual(expression.object.property, "profile");
});

test("parser: index access", () => {
  const expression = firstStatement("names[0]").expression;

  assert.strictEqual(expression.type, "MemberExpression");
  assert.strictEqual(expression.object.name, "names");
  assert.strictEqual(expression.property.value, 0);
  assert.strictEqual(expression.computed, true);
});

test("parser: chained index and member access", () => {
  const expression = firstStatement("users[0].name").expression;

  assert.strictEqual(expression.type, "MemberExpression");
  assert.strictEqual(expression.property, "name");
  assert.strictEqual(expression.object.type, "MemberExpression");
  assert.strictEqual(expression.object.computed, true);
});

test("parser: assignment to member and index", () => {
  const memberAssignment = firstStatement('user.name = "Sayed"').expression;
  const indexAssignment = firstStatement('names[0] = "Updated"').expression;

  assert.strictEqual(memberAssignment.type, "AssignmentExpression");
  assert.strictEqual(memberAssignment.target.type, "MemberExpression");
  assert.strictEqual(memberAssignment.target.property, "name");
  assert.strictEqual(indexAssignment.type, "AssignmentExpression");
  assert.strictEqual(indexAssignment.target.type, "MemberExpression");
  assert.strictEqual(indexAssignment.target.computed, true);
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
