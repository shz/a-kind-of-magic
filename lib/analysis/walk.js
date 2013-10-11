// List of work to do (further info scattered throughout comments):
//  * CatchClause
//  * this support
//  * global object (e.g. window) support
//  * Do some basic analysis to tell when a function is passed into
//    an IIFE and then executed
//  * Our typedef IfStatement magic can actually get smarter based
//    on what is in scope at the time.  It'd be super super cool.
//


// TODO - Provide a way to specify the name of the default global
//        namespace, e.g. 'window' in browser, 'root' in node; additionally
//        provide a way to specifify the name of the export object.


var estraverse = require('estraverse')
  , Scope = require('./scope')
  , browserEnv = require('../environments/browser')
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

    var argumentList = {};
    node.params.forEach(function(p) { argumentList[p.name] = true });
    state.scope.push('function', argumentList);
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
//   if (typeof foo != 'undefined') {} // TOdO
//   if (window.foo == 'undefined') {} // TODO
//   if (window.foo != 'undefined') {} // TODO
//   if (a.b.foo == 'undefined') {}    // TODO
//   if (a.b.foo != 'undefined') {}    // TODO
//
nodeHandlers['IfStatement'] = {
  enter: function(node, parent, state) {

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


// Old memberexpression code here, for reference until it's reimplemented
/*
 estraverse.traverse(ast, {
    enter: function(node, parent) {

      // The great and glorious switch
      switch (node.type) {


        // The first member expression we see bootstraps the stack,
        // which will be filled in on the way up.  We need to remember
        // the root MemberExpression node as well, in order to determine
        // when we're finished.
        case 'MemberExpression':
          if (!memberExpressionStack) {
            memberExpressionStack = [];
            memberExpressionTop = node;
          }

          // We'll be handling this ourselves, so don't record it
          if (node.property.type == 'Identifier')
            skipIdentifiers.push(node.property);
          if (node.object.type == 'Identifier')
            skipIdentifiers.push(node.object);

          break;

        // This doesn't do much in most cases, with the
        case 'AssignmentExpression':
          if (node.operator != '=')
            break;
          if (!memberExpressionStack) {
            memberExpressionStack = [];
            memberExpressionTop = node;
          }
          break;


      }
    },
    leave: function(node, parent) {

      // Functions hold a whole bunch of meaning for us
      if (node.type == 'FunctionExpression') {



      } else if (node.type == 'MemberExpression') {

        // Util to add the stack to the list
        var add = function() {
          var accum = [];
          if (memberExpressionStack[0] && !inScope(memberExpressionStack[0])) {
            for (var i=0; i<memberExpressionStack.length; i++) {
              accum.push(memberExpressionStack[i])
              var name = accum.join('.');
              if (!inScope(name))
                requires.push(accum.join('.'));
            }
          }
          memberExpressionStack = null;
          memberExpressionTop = null;
        };

        // Clean up
        if (node.property.type == 'Identifier')
          skipIdentifiers.splice(skipIdentifiers.indexOf(node.property), 1);
        if (node.object.type == 'Identifier')
          skipIdentifiers.splice(skipIdentifiers.indexOf(node.object), 1);

        // If there's no stack, we're already 'lost' in a computed
        // chain and can't do anything further.
        if (!memberExpressionStack)
          return;

        if (node.object.type == 'Identifier')
          memberExpressionStack.push(node.object.name);
        if (node.property.type == 'Identifier')
          memberExpressionStack.push(node.property.name);

        if (node == memberExpressionTop || node.computed)
          add();

      // Assignment expression with a memberExpressionStack works
      // almost the same as the final MemberExpression, except that
      // the property is a provides instead of a requires.
      } else if (node.type == 'AssignmentExpression' && node.operator == '=') {
        if (node == memberExpressionTop) {

          var accum = [];
          if (memberExpressionStack[0] && !inScope(memberExpressionStack[0])) {
            while (memberExpressionStack.length > 1) {
              accum.push(memberExpressionStack.shift());
              var name = accum.join('.');
              if (!inScope(name))
                requires.push(accum.join('.'));
            }
            accum.push(memberExpressionStack.pop());
            provides.push(accum.join('.'));
          }
          memberExpressionStack = null;
          memberExpressionTop = null;
        }
      }
    }
  });
*/
