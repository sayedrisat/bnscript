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

export function BlockStatement(body, location = {}) {
  return node("BlockStatement", { body }, location);
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

export default {
  Program,
  VarDeclaration,
  ConstDeclaration,
  PrintStatement,
  IfStatement,
  BlockStatement,
  ExpressionStatement,
  Identifier,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  UnaryExpression,
  BinaryExpression,
};
