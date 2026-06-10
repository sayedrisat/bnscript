function isNode(value) {
  return value && typeof value === "object" && typeof value.type === "string";
}

function pushNode(children, value) {
  if (isNode(value)) {
    children.push(value);
  }
}

function pushArray(children, values) {
  for (const value of values || []) {
    pushNode(children, value);
  }
}

function childNodes(node) {
  const children = [];

  switch (node?.type) {
    case "Program":
    case "BlockStatement":
    case "Block":
      pushArray(children, node.body);
      break;
    case "ImportDeclaration":
      pushNode(children, node.source);
      break;
    case "ExportDeclaration":
      pushNode(children, node.declaration);
      break;
    case "VarDeclaration":
    case "ConstDeclaration":
      pushNode(children, node.initializer);
      break;
    case "PrintStatement":
      pushArray(children, node.arguments);
      break;
    case "IfStatement":
      pushNode(children, node.condition);
      pushNode(children, node.consequent);
      for (const alternate of node.alternates || []) {
        pushNode(children, alternate.condition);
        pushNode(children, alternate.consequent);
      }
      pushNode(children, node.elseBlock);
      break;
    case "TryStatement":
      pushNode(children, node.tryBlock);
      pushNode(children, node.catchBlock);
      pushNode(children, node.finallyBlock);
      break;
    case "WhileStatement":
      pushNode(children, node.condition);
      pushNode(children, node.body);
      break;
    case "ForLoop":
      pushNode(children, node.start);
      pushNode(children, node.end);
      pushNode(children, node.body);
      break;
    case "ForEachLoop":
      pushNode(children, node.iterable);
      pushNode(children, node.body);
      break;
    case "FunctionDeclaration":
      pushNode(children, node.body);
      break;
    case "ReturnStatement":
      pushNode(children, node.value);
      break;
    case "ExpressionStatement":
      pushNode(children, node.expression);
      break;
    case "UnaryExpression":
      pushNode(children, node.operand);
      break;
    case "AwaitExpression":
      pushNode(children, node.argument);
      break;
    case "BinaryExpression":
      pushNode(children, node.left);
      pushNode(children, node.right);
      break;
    case "AssignmentExpression":
    case "Assignment":
      pushNode(children, node.target);
      pushNode(children, node.value);
      break;
    case "CallExpression":
      pushNode(children, node.callee);
      pushArray(children, node.arguments);
      break;
    case "MemberExpression":
      pushNode(children, node.object);
      if (node.computed) {
        pushNode(children, node.property);
      }
      break;
    case "ArrayLiteral":
      pushArray(children, node.elements);
      break;
    case "ObjectLiteral":
      for (const property of node.properties || []) {
        pushNode(children, property.value);
      }
      break;
    default:
      break;
  }

  return children;
}

export function walkAST(node, visitor) {
  if (!isNode(node)) {
    return;
  }

  const result = visitor(node);
  if (result === false) {
    return;
  }

  for (const child of childNodes(node)) {
    walkAST(child, visitor);
  }
}
