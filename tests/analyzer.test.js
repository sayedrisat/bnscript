import test from "node:test";
import assert from "node:assert";
import { tokenize } from "../src/lexer.js";
import { parse } from "../src/parser.js";
import { analyze } from "../src/analyzer.js";
import * as AST from "../src/ast.js";

function parseSource(source) {
  return parse(tokenize(source, "test.bn"), {
    filename: "test.bn",
    source,
  });
}

function analyzeSource(source) {
  return analyze(parseSource(source), {
    filename: "test.bn",
    source,
  });
}

function loc(line, column = 1) {
  return {
    line,
    column,
    start: 0,
    end: 0,
  };
}

function semanticError(fn, expectedMessage) {
  assert.throws(
    fn,
    (err) => {
      assert.strictEqual(err.name, "BNError");
      assert.strictEqual(err.category, "SemanticError");
      assert.ok(err.message.includes(expectedMessage));
      assert.ok(Array.isArray(err.errors));
      return true;
    }
  );
}

test("analyzer: valid declaration", () => {
  const ast = analyzeSource(`dhori name = "Risat"
dekhi name`);

  const declaration = ast.body[0];
  const identifier = ast.body[1].arguments[0];

  assert.strictEqual(declaration.semantic.declared, true);
  assert.strictEqual(declaration.semantic.kind, "variable");
  assert.strictEqual(declaration.semantic.mutable, true);
  assert.strictEqual(identifier.semantic.resolved, true);
  assert.strictEqual(identifier.semantic.scopeDepth, 0);
  assert.strictEqual(identifier.semantic.symbolKind, "variable");
});

test("analyzer: valid nested scope", () => {
  const ast = analyzeSource(`dhori x = 1
{
  dhori y = x
  dekhi y
}
dekhi x`);

  const block = ast.body[1];
  const innerInitializer = block.body[0].initializer;
  const innerPrintIdentifier = block.body[1].arguments[0];
  const outerPrintIdentifier = ast.body[2].arguments[0];

  assert.strictEqual(block.semantic.scopeType, "block");
  assert.strictEqual(innerInitializer.semantic.resolved, true);
  assert.strictEqual(innerInitializer.semantic.scopeDepth, 1);
  assert.strictEqual(innerPrintIdentifier.semantic.scopeDepth, 0);
  assert.strictEqual(outerPrintIdentifier.semantic.scopeDepth, 0);
});

test("analyzer: duplicate variable", () => {
  semanticError(
    () =>
      analyzeSource(`dhori count = 1
dhori count = 2`),
    'Duplicate declaration of "count"'
  );
});

test("analyzer: use before declaration", () => {
  semanticError(
    () =>
      analyzeSource(`dekhi name
dhori name = "Risat"`),
    'Use before declaration: "name"'
  );
});

test("analyzer: const reassignment", () => {
  const assignment = AST.AssignmentExpression(
    "=",
    AST.Identifier("API_URL", loc(2)),
    AST.StringLiteral("https://two.example", loc(2, 11)),
    loc(2)
  );
  const ast = AST.Program(
    [
      AST.ConstDeclaration(
        "API_URL",
        AST.StringLiteral("https://one.example", loc(1, 17)),
        loc(1)
      ),
      AST.ExpressionStatement(assignment, loc(2)),
    ],
    "test.bn",
    loc(1)
  );

  semanticError(
    () => analyze(ast, { filename: "test.bn" }),
    'Cannot reassign constant "API_URL"'
  );
});

test("analyzer: shadowing allowed in child scope", () => {
  const ast = analyzeSource(`dhori value = 1
{
  dhori value = 2
  dekhi value
}
dekhi value`);

  const innerIdentifier = ast.body[1].body[1].arguments[0];
  const outerIdentifier = ast.body[2].arguments[0];

  assert.strictEqual(ast.body[0].semantic.declared, true);
  assert.strictEqual(ast.body[1].body[0].semantic.declared, true);
  assert.strictEqual(innerIdentifier.semantic.scopeDepth, 0);
  assert.strictEqual(outerIdentifier.semantic.scopeDepth, 0);
});

test("analyzer: valid assignment to dhori", () => {
  const ast = analyzeSource(`dhori count = 0
count = count + 1`);

  const assignment = ast.body[1].expression;

  assert.strictEqual(assignment.type, "AssignmentExpression");
  assert.strictEqual(assignment.semantic.resolved, true);
  assert.strictEqual(assignment.semantic.targetMutable, true);
  assert.strictEqual(assignment.target.semantic.symbolKind, "variable");
});

test("analyzer: assignment to undeclared variable", () => {
  semanticError(
    () => analyzeSource("count = 1"),
    'Use before declaration: "count"'
  );
});

test("analyzer: assignment to sthir", () => {
  semanticError(
    () =>
      analyzeSource(`sthir limit = 10
limit = 11`),
    'Cannot reassign constant "limit"'
  );
});

test("analyzer: assignment reads previous value", () => {
  const ast = analyzeSource(`dhori count = 1
count = count + 1`);

  const previousValue = ast.body[1].expression.value.left;

  assert.strictEqual(previousValue.type, "Identifier");
  assert.strictEqual(previousValue.semantic.resolved, true);
  assert.strictEqual(previousValue.semantic.symbolKind, "variable");
});

test("analyzer: valid while loop", () => {
  const ast = analyzeSource(`dhori i = 0
jotokkhon i < 3 {
  dekhi i
  i = i + 1
}`);

  const statement = ast.body[1];

  assert.strictEqual(statement.type, "WhileStatement");
  assert.strictEqual(statement.semantic.isLoop, true);
  assert.strictEqual(statement.body.semantic.scopeType, "block");
});

test("analyzer: while loop resolves outer variable", () => {
  const ast = analyzeSource(`dhori i = 0
jotokkhon i < 3 {
  dekhi i
}`);

  const conditionIdentifier = ast.body[1].condition.left;
  const bodyIdentifier = ast.body[1].body.body[0].arguments[0];

  assert.strictEqual(conditionIdentifier.semantic.resolved, true);
  assert.strictEqual(conditionIdentifier.semantic.scopeDepth, 0);
  assert.strictEqual(bodyIdentifier.semantic.resolved, true);
  assert.strictEqual(bodyIdentifier.semantic.scopeDepth, 1);
});

test("analyzer: assignment inside while works", () => {
  const ast = analyzeSource(`dhori i = 0
jotokkhon i < 3 {
  i = i + 1
}`);

  const assignment = ast.body[1].body.body[0].expression;

  assert.strictEqual(assignment.type, "AssignmentExpression");
  assert.strictEqual(assignment.semantic.resolved, true);
});

test("analyzer: undeclared condition variable", () => {
  semanticError(
    () =>
      analyzeSource(`jotokkhon missing < 3 {
  dekhi "never"
}`),
    'Use before declaration: "missing"'
  );
});

test("analyzer: array literal values resolve identifiers", () => {
  const ast = analyzeSource(`dhori first = 1
dhori values = [first, 2]`);

  const identifier = ast.body[1].initializer.elements[0];

  assert.strictEqual(identifier.type, "Identifier");
  assert.strictEqual(identifier.semantic.resolved, true);
  assert.strictEqual(identifier.semantic.symbolKind, "variable");
});

test("analyzer: object literal values resolve identifiers", () => {
  const ast = analyzeSource(`dhori city = "Dhaka"
dhori user = {
  profile: {
    city: city
  }
}`);

  const cityIdentifier =
    ast.body[1].initializer.properties[0].value.properties[0].value;

  assert.strictEqual(cityIdentifier.type, "Identifier");
  assert.strictEqual(cityIdentifier.semantic.resolved, true);
  assert.strictEqual(cityIdentifier.semantic.symbolKind, "variable");
});

test("analyzer: member access resolves base", () => {
  const ast = analyzeSource(`dhori user = {
  name: "Risat"
}
dekhi user.name`);

  const expression = ast.body[1].arguments[0];

  assert.strictEqual(expression.type, "MemberExpression");
  assert.strictEqual(expression.object.semantic.resolved, true);
});

test("analyzer: chained member access resolves base", () => {
  const ast = analyzeSource(`dhori user = {
  profile: {
    city: "Dhaka"
  }
}
dekhi user.profile.city`);

  const expression = ast.body[1].arguments[0];

  assert.strictEqual(expression.type, "MemberExpression");
  assert.strictEqual(expression.object.object.semantic.resolved, true);
});

test("analyzer: index access resolves base and index", () => {
  const ast = analyzeSource(`dhori names = ["Risat"]
dhori index = 0
dekhi names[index]`);

  const expression = ast.body[2].arguments[0];

  assert.strictEqual(expression.type, "MemberExpression");
  assert.strictEqual(expression.object.semantic.resolved, true);
  assert.strictEqual(expression.property.semantic.resolved, true);
});

test("analyzer: undeclared member access base", () => {
  semanticError(
    () => analyzeSource("dekhi user.name"),
    'Use before declaration: "user"'
  );
});

test("analyzer: undeclared index access base", () => {
  semanticError(
    () => analyzeSource("dekhi names[0]"),
    'Use before declaration: "names"'
  );
});

test("analyzer: assignment to member", () => {
  const ast = analyzeSource(`dhori user = {
  name: "Risat"
}
user.name = "Sayed"`);

  const assignment = ast.body[1].expression;

  assert.strictEqual(assignment.type, "AssignmentExpression");
  assert.strictEqual(assignment.target.type, "MemberExpression");
  assert.strictEqual(assignment.target.object.semantic.resolved, true);
  assert.strictEqual(assignment.semantic.resolved, true);
});

test("analyzer: assignment to index", () => {
  const ast = analyzeSource(`dhori names = ["Risat"]
names[0] = "Updated"`);

  const assignment = ast.body[1].expression;

  assert.strictEqual(assignment.type, "AssignmentExpression");
  assert.strictEqual(assignment.target.type, "MemberExpression");
  assert.strictEqual(assignment.target.object.semantic.resolved, true);
  assert.strictEqual(assignment.semantic.resolved, true);
});

test("analyzer: valid function declaration", () => {
  const ast = analyzeSource(`kaj greet(name) {
  ferot name
}`);

  const declaration = ast.body[0];

  assert.strictEqual(declaration.semantic.declared, true);
  assert.strictEqual(declaration.semantic.kind, "function");
  assert.strictEqual(declaration.semantic.mutable, false);
  assert.strictEqual(declaration.body.semantic.scopeType, "function");
});

test("analyzer: valid function call", () => {
  const ast = analyzeSource(`kaj greet(name) {
  ferot name
}
dekhi greet("Risat")`);

  const call = ast.body[1].arguments[0];

  assert.strictEqual(call.type, "CallExpression");
  assert.strictEqual(call.callee.semantic.resolved, true);
  assert.strictEqual(call.callee.semantic.symbolKind, "function");
});

test("analyzer: parameter resolves inside function", () => {
  const ast = analyzeSource(`kaj identity(value) {
  ferot value
}`);

  const identifier = ast.body[0].body.body[0].value;

  assert.strictEqual(identifier.semantic.resolved, true);
  assert.strictEqual(identifier.semantic.scopeDepth, 0);
  assert.strictEqual(identifier.semantic.symbolKind, "parameter");
});

test("analyzer: duplicate parameter", () => {
  semanticError(
    () =>
      analyzeSource(`kaj greet(name, name) {
  ferot name
}`),
    'Duplicate parameter "name"'
  );
});

test("analyzer: use before declaration for function call", () => {
  semanticError(
    () =>
      analyzeSource(`dekhi greet("Risat")
kaj greet(name) {
  ferot name
}`),
    'Use before declaration: "greet"'
  );
});

test("analyzer: return outside function error", () => {
  semanticError(
    () => analyzeSource("ferot 1"),
    'Cannot use "ferot" at the top level'
  );
});

test("analyzer: top-level ferot", () => {
  const ast = AST.Program(
    [{ type: "ReturnStatement", value: null, ...loc(1) }],
    "test.bn",
    loc(1)
  );

  semanticError(
    () => analyze(ast, { filename: "test.bn" }),
    'Cannot use "ferot" at the top level'
  );
});

test("analyzer: break outside loop", () => {
  const ast = AST.Program(
    [{ type: "BreakStatement", ...loc(1) }],
    "test.bn",
    loc(1)
  );

  semanticError(
    () => analyze(ast, { filename: "test.bn" }),
    'Cannot use "bekkhon" outside a loop'
  );
});

test("analyzer: continue outside loop", () => {
  const ast = AST.Program(
    [{ type: "ContinueStatement", ...loc(1) }],
    "test.bn",
    loc(1)
  );

  semanticError(
    () => analyze(ast, { filename: "test.bn" }),
    'Cannot use "cholo" outside a loop'
  );
});
