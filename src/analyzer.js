import { createError } from "./errors.js";
import {
  createBlockScope,
  createFunctionScope,
  createGlobalScope,
} from "./scope.js";

const MAX_ERRORS = 20;

export class SemanticAnalyzer {
  constructor(ast, { filename, source = "" } = {}) {
    this.ast = ast;
    this.filename = filename || ast?.sourceFile || "<anonymous>";
    this.sourceLines = source ? source.split(/\r?\n/) : [];
    this.globalScope = createGlobalScope();
    this.currentScope = this.globalScope;
    this.errors = [];
    this.loopDepth = 0;
    this.functionDepth = 0;
  }

  analyze() {
    this.visit(this.ast);

    if (this.errors.length > 0) {
      this.errors[0].errors = this.errors;
      throw this.errors[0];
    }

    return this.ast;
  }

  visit(node) {
    if (!node) {
      return;
    }

    this.markChecked(node);

    switch (node.type) {
      case "Program":
        return this.visitProgram(node);
      case "VarDeclaration":
        return this.visitDeclaration(node, {
          kind: "variable",
          mutable: true,
          keyword: "dhori",
        });
      case "ConstDeclaration":
        return this.visitDeclaration(node, {
          kind: "constant",
          mutable: false,
          keyword: "sthir",
        });
      case "BlockStatement":
      case "Block":
        return this.visitBlock(node);
      case "PrintStatement":
        return this.visitPrintStatement(node);
      case "IfStatement":
        return this.visitIfStatement(node);
      case "ExpressionStatement":
        return this.visit(node.expression);
      case "Assignment":
      case "AssignmentExpression":
        return this.visitAssignmentExpression(node);
      case "Identifier":
        return this.resolveIdentifier(node);
      case "UnaryExpression":
        return this.visit(node.operand);
      case "BinaryExpression":
      case "LogicalExpression":
        this.visit(node.left);
        return this.visit(node.right);
      case "CallExpression":
        return this.visitCallExpression(node);
      case "MemberExpression":
        return this.visitMemberExpression(node);
      case "ArrayLiteral":
        return this.visitArrayLiteral(node);
      case "ObjectLiteral":
        return this.visitObjectLiteral(node);
      case "ReturnStatement":
        return this.visitReturnStatement(node);
      case "BreakStatement":
        return this.visitBreakStatement(node);
      case "ContinueStatement":
        return this.visitContinueStatement(node);
      case "WhileStatement":
        return this.visitWhileStatement(node);
      case "ForLoop":
        return this.visitForLoop(node);
      case "ForEachLoop":
        return this.visitForEachLoop(node);
      case "FunctionDeclaration":
        return this.visitFunctionDeclaration(node);
      case "NumberLiteral":
      case "StringLiteral":
      case "BooleanLiteral":
      case "NullLiteral":
        return;
      default:
        return this.visitUnknownNode(node);
    }
  }

  visitProgram(node) {
    node.semantic.scopeType = "global";

    for (const statement of node.body) {
      this.visit(statement);
      if (this.errors.length >= MAX_ERRORS) {
        break;
      }
    }
  }

  visitDeclaration(node, { kind, mutable, keyword }) {
    // Initializers are checked before the new name is declared, which catches
    // self-references and normal use-before-declaration mistakes.
    this.visit(node.initializer);

    const result = this.currentScope.declare(node.name, {
      kind,
      mutable,
      declaration: node,
      line: node.line,
      column: node.column,
    });

    node.semantic.kind = kind;
    node.semantic.mutable = mutable;
    node.semantic.scopeType = this.currentScope.type;

    if (!result.ok) {
      node.semantic.declared = false;
      this.addError(
        node,
        `Duplicate declaration of "${node.name}" in the same scope.`,
        `Rename this ${keyword} declaration or remove the earlier declaration on line ${result.existing.line}.`
      );
      return;
    }

    node.semantic.declared = true;
    node.semantic.declarationLine = node.line;
  }

  visitBlock(node) {
    node.semantic.scopeType = "block";
    this.withScope(createBlockScope(this.currentScope), () => {
      for (const statement of node.body) {
        this.visit(statement);
        if (this.errors.length >= MAX_ERRORS) {
          break;
        }
      }
    });
  }

  visitPrintStatement(node) {
    for (const argument of node.arguments) {
      this.visit(argument);
    }
  }

  visitIfStatement(node) {
    this.visit(node.condition);
    this.visit(node.consequent);

    for (const alternate of node.alternates || []) {
      this.markChecked(alternate);
      this.visit(alternate.condition);
      this.visit(alternate.consequent);
    }

    this.visit(node.elseBlock);
  }

  visitAssignmentExpression(node) {
    node.semantic.kind = "assignment";
    node.semantic.operator = node.operator;
    node.semantic.scopeType = this.currentScope.type;

    if (!this.isAssignmentTarget(node.target)) {
      this.addError(
        node,
        "Invalid assignment target.",
        "Assign to an identifier, member, or index target."
      );
      this.visit(node.target);
      this.visit(node.value);
      node.semantic.resolved = false;
      return;
    }

    const targetResolution = this.visitAssignmentTarget(node.target);

    if (targetResolution && !targetResolution.symbol.mutable) {
      this.addError(
        node.target,
        `Cannot reassign constant "${node.target.name}".`,
        `Use "dhori" instead of "sthir" if "${node.target.name}" needs to change.`
      );
    }

    if (targetResolution) {
      node.semantic.resolved = true;
      node.semantic.targetKind = targetResolution.symbol.kind;
      node.semantic.targetMutable = targetResolution.symbol.mutable;
      node.semantic.declarationLine = targetResolution.symbol.line;
    } else {
      node.semantic.resolved = node.target?.type === "MemberExpression";
    }

    this.visit(node.value);
  }

  visitAssignmentTarget(node) {
    if (node?.type === "Identifier") {
      return this.resolveIdentifier(node, {
        assignmentTarget: true,
      });
    }

    if (node?.type === "MemberExpression") {
      this.visitMemberExpression(node);
    }

    return null;
  }

  visitWhileStatement(node) {
    this.visit(node.condition);

    this.loopDepth += 1;
    try {
      this.visit(node.body);
    } finally {
      this.loopDepth -= 1;
    }

    node.semantic.isLoop = true;
  }

  visitReturnStatement(node) {
    if (this.functionDepth === 0) {
      this.addError(
        node,
        'Cannot use "ferot" at the top level.',
        'Move "ferot" inside a "kaj" function body.'
      );
    }

    this.visit(node.value);
  }

  visitCallExpression(node) {
    this.visit(node.callee);

    for (const argument of node.arguments || []) {
      this.visit(argument);
    }
  }

  visitMemberExpression(node) {
    this.markChecked(node);
    this.visit(node.object);

    if (node.computed) {
      this.visit(node.property);
    }
  }

  visitArrayLiteral(node) {
    this.markChecked(node);
    for (const element of node.elements || []) {
      this.visit(element);
    }
  }

  visitObjectLiteral(node) {
    this.markChecked(node);
    for (const property of node.properties || []) {
      this.markChecked(property);
      this.visit(property.value);
    }
  }

  visitBreakStatement(node) {
    if (this.loopDepth === 0) {
      this.addError(
        node,
        'Cannot use "bekkhon" outside a loop.',
        'Move "bekkhon" inside a "bar" or "jotokkhon" loop.'
      );
    }
  }

  visitContinueStatement(node) {
    if (this.loopDepth === 0) {
      this.addError(
        node,
        'Cannot use "cholo" outside a loop.',
        'Move "cholo" inside a "bar" or "jotokkhon" loop.'
      );
    }
  }

  visitForLoop(node) {
    this.visitLoop(node, () => {
      if (node.variant === "range") {
        this.withScope(createBlockScope(this.currentScope), () => {
          this.declareLoopIterator(node.iterator, node);
          this.visit(node.start);
          this.visit(node.end);
          this.visit(node.body);
        });
        return;
      }

      this.visit(node.count);
      this.visit(node.body);
    });
  }

  visitForEachLoop(node) {
    this.visitLoop(node, () => {
      this.withScope(createBlockScope(this.currentScope), () => {
        this.declareLoopIterator(node.iterator, node);
        this.visit(node.iterable);
        this.visit(node.body);
      });
    });
  }

  visitFunctionDeclaration(node) {
    const result = this.currentScope.declare(node.name, {
      kind: "function",
      mutable: false,
      declaration: node,
      line: node.line,
      column: node.column,
    });

    node.semantic.kind = "function";
    node.semantic.mutable = false;
    node.semantic.scopeType = this.currentScope.type;
    node.semantic.declared = result.ok;

    if (!result.ok) {
      this.addError(
        node,
        `Duplicate declaration of "${node.name}" in the same scope.`,
        `Rename this function or remove the earlier declaration on line ${result.existing.line}.`
      );
      return;
    }

    this.functionDepth += 1;
    this.withScope(createFunctionScope(this.currentScope), () => {
      for (const param of node.params || []) {
        const name = typeof param === "string" ? param : param.name;
        const result = this.currentScope.declare(name, {
          kind: "parameter",
          mutable: true,
          declaration: param,
          line: param.line || node.line,
          column: param.column || node.column,
        });

        if (!result.ok) {
          this.addError(
            param,
            `Duplicate parameter "${name}" in function "${node.name}".`,
            `Rename this parameter or remove the earlier parameter on line ${result.existing.line}.`
          );
        }
      }
      this.visitFunctionBody(node.body);
    });
    this.functionDepth -= 1;
  }

  visitFunctionBody(node) {
    this.markChecked(node);
    node.semantic.scopeType = "function";

    for (const statement of node.body || []) {
      this.visit(statement);
      if (this.errors.length >= MAX_ERRORS) {
        break;
      }
    }
  }

  visitUnknownNode(node) {
    if (Array.isArray(node.body)) {
      for (const child of node.body) {
        this.visit(child);
      }
    }
  }

  declareLoopIterator(name, node) {
    if (!name) {
      return;
    }

    const result = this.currentScope.declare(name, {
      kind: "variable",
      mutable: true,
      declaration: node,
      line: node.line,
      column: node.column,
    });

    if (!result.ok) {
      this.addError(
        node,
        `Duplicate declaration of "${name}" in the same scope.`,
        `Rename this iterator or remove the earlier declaration on line ${result.existing.line}.`
      );
    }
  }

  resolveIdentifier(node, { assignmentTarget = false } = {}) {
    this.markChecked(node);
    const resolution = this.currentScope.resolve(node.name);

    if (!resolution) {
      node.semantic.resolved = false;
      this.addError(
        node,
        `Use before declaration: "${node.name}" is not declared.`,
        assignmentTarget
          ? `Declare "${node.name}" with "dhori" before assigning to it.`
          : `Declare "${node.name}" with "dhori" or "sthir" before using it.`
      );
      return null;
    }

    resolution.symbol.used = true;
    node.semantic.resolved = true;
    node.semantic.scopeDepth = resolution.depth;
    node.semantic.isMutable = resolution.symbol.mutable;
    node.semantic.symbolKind = resolution.symbol.kind;
    node.semantic.declarationLine = resolution.symbol.line;

    return resolution;
  }

  visitLoop(node, callback) {
    this.loopDepth += 1;
    callback();
    this.loopDepth -= 1;
    node.semantic.isLoop = true;
  }

  withScope(scope, callback) {
    const previousScope = this.currentScope;
    this.currentScope = scope;
    try {
      callback();
    } finally {
      this.currentScope = previousScope;
    }
  }

  markChecked(node) {
    if (node && typeof node === "object") {
      node.semantic = {
        ...(node.semantic || {}),
        checked: true,
      };
    }
  }

  isAssignmentTarget(node) {
    return node?.type === "Identifier" || node?.type === "MemberExpression";
  }

  addError(node, message, suggestion) {
    if (this.errors.length >= MAX_ERRORS) {
      return;
    }

    this.errors.push(
      createError({
        category: "SemanticError",
        message,
        filename: this.filename,
        line: node?.line,
        column: node?.column,
        sourceLine: this.sourceLine(node?.line),
        suggestion,
      })
    );
  }

  sourceLine(line) {
    return this.sourceLines[line - 1];
  }
}

export function analyze(ast, options = {}) {
  return new SemanticAnalyzer(ast, options).analyze();
}
