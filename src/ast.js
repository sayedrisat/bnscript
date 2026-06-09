function locationFields(location = {}) {
  const fields = {};
  for (const key of ["line", "column", "start", "end"]) {
    if (location[key] !== undefined) {
      fields[key] = location[key];
    }
  }
  return fields;
}

function node(type, properties, location) {
  return {
    type,
    ...properties,
    ...locationFields(location),
  };
}

export function Program(body, sourceFile = "<anonymous>", location = {}) {
  return node("Program", { body, sourceFile }, location);
}

export function VarDeclaration(name, initializer, location = {}) {
  return node("VarDeclaration", { name, initializer }, location);
}

export function ConstDeclaration(name, initializer, location = {}) {
  return node("ConstDeclaration", { name, initializer }, location);
}

export function ImportSpecifier(name, location = {}) {
  return {
    name,
    ...locationFields(location),
  };
}

export function ImportDeclaration(imports, source, location = {}) {
  return node("ImportDeclaration", { imports, source }, location);
}

export function ExportDeclaration(declaration, location = {}) {
  return node("ExportDeclaration", { declaration }, location);
}

export function PrintStatement(args, location = {}) {
  return node("PrintStatement", { arguments: args }, location);
}

export function IfStatement(
  condition,
  consequent,
  alternates = [],
  elseBlock = null,
  location = {}
) {
  return node(
    "IfStatement",
    { condition, consequent, alternates, elseBlock },
    location
  );
}

export function WhileStatement(condition, body, location = {}) {
  return node("WhileStatement", { condition, body }, location);
}

export function ForLoop(iterator, start, end, body, location = {}) {
  return {
    type: "ForLoop",
    variant: "range",
    iterator,
    ...locationFields(location),
    start,
    end,
    body,
  };
}

export function ForEachLoop(iterator, iterable, body, location = {}) {
  return node("ForEachLoop", { iterator, iterable, body }, location);
}

export function BlockStatement(body, location = {}) {
  return node("BlockStatement", { body }, location);
}

export function FunctionDeclaration(name, params, body, location = {}) {
  return node(
    "FunctionDeclaration",
    { name, params, body, isAsync: false, isExported: false },
    location
  );
}

export function Parameter(name, location = {}, defaultValue = null) {
  return {
    name,
    defaultValue,
    ...locationFields(location),
  };
}

export function ReturnStatement(value = null, location = {}) {
  return node("ReturnStatement", { value }, location);
}

export function BreakStatement(location = {}) {
  return node("BreakStatement", {}, location);
}

export function ContinueStatement(location = {}) {
  return node("ContinueStatement", {}, location);
}

export function ExpressionStatement(expression, location = {}) {
  return node("ExpressionStatement", { expression }, location);
}

export function Identifier(name, location = {}) {
  return node("Identifier", { name }, location);
}

export function NumberLiteral(value, raw, location = {}) {
  return node("NumberLiteral", { value, raw }, location);
}

export function StringLiteral(value, location = {}, hasInterpolation = false) {
  return node("StringLiteral", { value, hasInterpolation }, location);
}

export function BooleanLiteral(value, location = {}) {
  return node("BooleanLiteral", { value }, location);
}

export function NullLiteral(location = {}) {
  return node("NullLiteral", { value: null }, location);
}

export function UnaryExpression(operator, operand, location = {}) {
  return node("UnaryExpression", { operator, operand }, location);
}

export function BinaryExpression(operator, left, right, location = {}) {
  return node("BinaryExpression", { operator, left, right }, location);
}

export function AssignmentExpression(operator, target, value, location = {}) {
  return node("AssignmentExpression", { operator, target, value }, location);
}

export function CallExpression(callee, args, location = {}) {
  return node("CallExpression", { callee, arguments: args }, location);
}

export function MemberExpression(object, property, computed = false, location = {}) {
  return node("MemberExpression", { object, property, computed }, location);
}

export function ArrayLiteral(elements, location = {}) {
  return node("ArrayLiteral", { elements }, location);
}

export function ObjectLiteral(properties, location = {}) {
  return node("ObjectLiteral", { properties }, location);
}

export function ObjectProperty(key, value, location = {}) {
  return {
    key,
    value,
    ...locationFields(location),
  };
}

export default {
  Program,
  VarDeclaration,
  ConstDeclaration,
  ImportSpecifier,
  ImportDeclaration,
  ExportDeclaration,
  PrintStatement,
  IfStatement,
  WhileStatement,
  ForLoop,
  ForEachLoop,
  BlockStatement,
  FunctionDeclaration,
  Parameter,
  ReturnStatement,
  BreakStatement,
  ContinueStatement,
  ExpressionStatement,
  Identifier,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  UnaryExpression,
  BinaryExpression,
  AssignmentExpression,
  CallExpression,
  MemberExpression,
  ArrayLiteral,
  ObjectLiteral,
  ObjectProperty,
};
