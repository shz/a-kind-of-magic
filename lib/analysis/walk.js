// List of work to do (further info scattered throughout comments):
//  * CatchClause
//  * Root node? (wire in hoistinator)
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
  , typeofHelper = require('./typeof')
  , hoistinator = require('./hoistinator')
  ;

// Ease of use...
var SKIP = estraverse.VisitorOption.Skip;
var BREAK = estraverse.VisitorOption.Break;

// If behavior is required on a node, it goes here
var nodeHandlers = {};

//
// At the very root of the tree, pull out hoisted declarations
//
nodeHandlers['Program'] = {
  enter: function(node, parent, state) {
    hoistinator(node, state);
  }
};

//
// We skip non IIFE functions entirely.  Otherwise, we
// push a new scope onto the stack and add the function
// argument names to it.  We also do a pre-pass into the
// function body to extract hoisted declarations.
//
nodeHandlers['FunctionExpression'] = {
  enter: function(node, parent, state) {
    if (!parent || parent.type != 'CallExpression' || parent.callee != node)
      return SKIP;

    state.scope.push('function')
    node.params.forEach(function(p) { state.scope.add('function', p.name) });
    hoistinator(node.body, state);
  },
  exit: function(node, parent, state) {
    if (!parent || parent.type != 'CallExpression')
      return;

    scope.pop('function');
  }
};

//
// Function and variable declarations simply get added to
// scope.  We don't actually handle them during the regular
// walk, however, due to hoisting.  So in the regular pass
// here, we do nothing.  There's a prepass that finds these
// guys for IIFEs and the root node.
//
nodeHandlers['FunctionDeclaration'] = undefined;
nodeHandlers['VariableDeclarator'] = undefined;

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
// type patterns anyway that bypasses this check.
//
nodeHandlers['UnaryExpression'] = {
  enter: function(node, parent, state) {
    if (node.operator == 'typeof')
      return SKIP;
  }
};

//
// We handle a few specified cases of typeof-based if statements
// that are complicated enough that we pass them on to a dedicated
// module, which does the work for us.
//
nodeHandlers['IfStatement'] = {
  enter: function(node, parent, state) {
    if (typeofHelper.understands(node.test)) {
      var result = typeofHelper.handle(node.test, state);
      state.requires = state.requires.concat(result.requires);
      state.scope.push('conditional', result.conditionals);
      estraverse.traverse(node.consequent, state.traverser);

      // TODO - Handle negative case (node.alternate).  Likely accomplished
      //        by moving OUT of scope and into its own dedicated stack
      //        format with positive/negative branches for each item.

      return SKIP;
    }
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
  state.scope.push('conditional');

  // Allow handlers to traverse while skipping bits by storing the
  // traverse logic inside the state itself.
  state.traverser = {
    enter: function(node, parent) {
      if (nodeHandlers[node.type] && nodeHandlers[node.type].enter)
        return nodeHandlers[node.type].enter(node, parent, state);
    },
    exit: function(node, parent) {
      if (nodeHandlers[node.type] && nodeHandlers[node.type].exit)
        return nodeHandlers[node.type].exit(node, parent, state);
    }
  };

  // Let's do it!
  estraverse.traverse(ast, state.traverser);

  // Anything left in the root need to get added to provide
  for (var i in state.scope['function'][0]) if (state.scope['function'][0].hasOwnProperty(i))
    provides.push(i);
};
