// List of work to do (further info scattered throughout comments):
//  * CatchClause
//  * this support
//  * global object (e.g. window) support
//  * Do some basic analysis to tell when a function is passed into
//    an IIFE and then executed
//


// TODO - Provide a way to specify the name of the default global
//        namespace, e.g. 'window' in browser, 'root' in node; additionally
//        provide a way to specifify the name of the export object.


var estraverse = require('estraverse')
  , browserEnv = require('../environments/browser')
  , Scope = require('./scope')
  , memberWalker = require('./member_walker')
  ;


// Ease of use...
var SKIP = estraverse.VisitorOption.Skip;
var BREAK = estraverse.VisitorOption.Break;

// If behavior is required on a node, it goes here
var nodeHandlers = {};

//
// We skip non IIFE functions entirely.  Otherwise, we
// push a new scope onto the stack and add the function
// argument names to it.
//
nodeHandlers['FunctionExpression'] = {
  enter: function(node, parent, state) {
    if (!parent || parent.type != 'CallExpression' || parent.callee != node)
      return SKIP;

    state.scope.push('function')
    node.params.forEach(function(p) { state.scope.add('function', p.name) });
  },
  exit: function(node, parent, state) {
    if (!parent || parent.type != 'CallExpression')
      return;

    scope.pop('function');
  }
};

//
// Function and variable declaration statements simply get added
// to the scope.  Easy.
//
nodeHandlers['FunctionDeclaration'] =
nodeHandlers['VariableDeclarator'] = {
  enter: function(node, parent, state) {
    state.scope.add('function', node.id.name);

    // Don't deal with the bodies
    if (node.type == 'FunctionDeclaration')
      return SKIP;
  }
};

//
// Any identifier that's not in scope gets added to the requires list
//
nodeHandlers['Identifier'] = {
  enter: function(node, parent, state) {
    if (!state.scope.has(node.name))
      state.requires.push(node.name);
  }
};

//
// Ignore anything in a typeof.  Note that, below, we
// make a solid attempt to catch
//
//   if (typeof foo == 'blah') { ... }
//
// type patterns anyway.
//
nodeHandlers['UnaryExpression'] = {
  enter: function(node, parent, state) {
    if (node.operator == 'typeof')
      return SKIP;
  }
};

//
// Because we know the scope at the time the if statement is
// evaluated, we can correctly branch down if/else statements
// of the following forms:
//
//   if (typeof foo == 'undefined') {} // TODO
//   if (typeof foo != 'undefined') {} // TODO
//   if (window.foo == 'undefined') {} // TODO
//   if (window.foo != 'undefined') {} // TODO
//   if (a.b.foo == 'undefined') {}    // TODO
//   if (a.b.foo != 'undefined') {}    // TODO
//
nodeHandlers['IfStatement'] = {
  enter: function(node, parent, state) {

  }
};

//
// Handle read-only member expressions.  We deal with assigment
// to a member expression by dealing with the assignment operator
// first.
//
nodeHandlers['MemberExpression'] = {
  enter: function(node, parent, state) {
    var output = memberWalker(node).output;

    if (state.scope['function'][0][output[0]] || !state.scope.has(output[0])) {
      output.forEach(function(p) {
        state.requires.push(p);
      });
    }
    return SKIP;
  }
};

//
// We handle a couple different cases here:
//
//  * Assignment to the end of a MemberExpression (e.g. a.b.c = 'foo')
//  * Assignment to an implicitly global variable (e.g. a = 'foo')
//
nodeHandlers['AssignmentExpression'] = {
  enter: function(node, parent, state) {
    if (node.operator != '=')
      return;

    // Handle global assignment
    if (node.left.type == 'Identifier' && !state.scope.has(node.left.name)) {
      state.scope.add('global', node.left.name);
      return;
    }

    // Handle MemberExpression assignment
    if (node.left.type == 'MemberExpression') {
      var result = memberWalker(node.left);
      if (result.fullyChained)
        state.scope.add('function', result.output.pop());
      memberWalker(node).output.forEach(function(p) { state.requires.push(p) });

    }
  }
};

var walk = module.exports = function(ast, requires, provides) {
  var state = {};
  state.requires = requires;
  state.provides = provides;

  // Used to track nested levels of scope
  state.scope = scope = new Scope();
  state.scope.push('function');
  state.scope.push('builtin', browserEnv.builtins);

  // Let's do it!
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (nodeHandlers[node.type] && nodeHandlers[node.type].enter)
        return nodeHandlers[node.type].enter(node, parent, state);
    },
    exit: function(node, parent) {
      if (nodeHandlers[node.type] && nodeHandlers[node.type].exit)
        return nodeHandlers[node.type].exit(node, parent, state);
    }
  });

  // Anything left in the root need to get added to provide
  for (var i in state.scope['function'][0]) if (state.scope['function'][0].hasOwnProperty(i))
    provides.push(i);
};
