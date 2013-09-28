var estraverse = require('estraverse')
  ;

// This file just oozes computer science.

// List of work to do (further info scattered throughout comments):
//  * CatchClause
//  * this support
//  * Builtins
//  * global object (e.g. window) support
//  * Do some basic analysis to tell when a function is passed into
//    an IIFE and then executed

// Using functions for these instead of a dumb list or
// whatever allows regexes and similar tools to be used.
var isBuiltinBrowser = function() {
  // TODO
  return false;
};
var isBuiltinNode = function() {
  // TODO
  return false;
};
var isBuiltin = isBuiltinBrowser;

// TODO - Provide a way to specify the name of the default global
//        namespace, e.g. 'window' in browser, 'root' in node; additionally
//        provide a way to specifify the name of the export object.

// NOTE - We have to roll this by hand.  Unfortunately, after
//        a few experiments with what escope gives us, it's
//        solidly inadequate :(
var walk = function(ast, requires, provides) {
  var isGlobal = 1;
  var memberExpressionStack = null;
  var memberExpressionTop = null;

  // In many situations we need to skip normal tracking behavior for
  // Identifier nodes.  This holds a list of what should be skipped.
  var skipIdentifiers = [];

  // We do some magic with typeof's in if conditions
  var typeofStack = [];
  var typeofIfStack = [];

  // Function scope management
  var scope = [{}]
  var inScope = function(name) {
    // If the name is blank we have a problem
    if (name == '')
      throw new Error('Blank identifier');

    // Ignore builtins
    if (isBuiltin(name))
      return true;

    // Handle function scope
    for (var i=0; i<scope.length; i++)
      if (scope[i].hasOwnProperty(name))
        return true;

    // Allow identifiers that have been defined in a parent if condition
    if (typeofStack.indexOf(name) != -1)
      return true;

    return false;
  };

  estraverse.traverse(ast, {
    enter: function(node, parent) {

      // Functions hold a whole bunch of meaning for us
      if (node.type == 'FunctionExpression') {

        // Don't walk into non-iife functions
        if (!parent || parent.type != 'CallExpression' || parent.callee != node)
          return estraverse.VisitorOption.Skip;

        // Once we're in a function expression, variables will no longer
        // fall into global scope automatically.
        isGlobal--;

        // We also get a new scope
        var s = {};
        node.params.forEach(function(p) { s[p.name] = true });
        scope.push(s);
      }

      // The great and glorious switch
      switch (node.type) {

        case 'FunctionDeclaration':
        case 'VariableDeclarator':
          if (isGlobal)
            provides.push(node.id.name);
          scope[scope.length-1][node.id.name] = true;
          if (node.type == 'FunctionDeclaration')
            return estraverse.VisitorOption.Skip;
          break;

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

        // Ignore everything in a typeof expression
        case 'UnaryExpression':
          if (node.operator == 'typeof') {

            // Skip the interior of a typeof node
            return estraverse.VisitorOption.Skip;
          }
          break;

        // For if statements we do some magic with typeof that requires
        // tracking, which we do here.
        case 'IfStatement':
          // Hunt for simple typeof's in the condition
          estraverse.traverse(node.test, {enter: function(node, parent) {
            if (node.type == 'UnaryExpression' && node.operator == 'typeof')
            if (node.argument.type == 'Identifier') {
              typeofStack.push(node.argument.name);
              typeofIfStack.push(node);
            }
          }});
          break;

        case 'Identifier':
          if (!inScope(node.name) && skipIdentifiers.indexOf(node) == -1)
            requires.push(node.name);
          break;

      }
    },
    leave: function(node, parent) {

      // Functions hold a whole bunch of meaning for us
      if (node.type == 'FunctionExpression') {

        // Don't walk into non-iife functions
        if (!parent || parent.type != 'CallExpression')
          return;

        // Since we're heading out of a function, we can pop the
        // isglobal stack.
        isGlobal--;

        // Our scope is also irrelevant from now on
        scope.pop();

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

      // Clean up after our typeof magic
      } else if (node.type == 'IfStatement') {
        if (typeofIfStack[typeofIfStack.length - 1] == node) {
          typeofStack.pop();
          typeofIfStack.pop();
        }
      }
    }
  });
};

var go = module.exports = function(ast) {
  var requires = [];
  var provides = [];
  var noRequires = [];
  var noProvides = [];

  // Look for AKOM directives
  if (ast.type == 'Program') {
    for (var i=0; i<ast.body.length; i++) {
      var e = ast.body[i];
      if (e.type == 'ExpressionStatement')
      if (e.expression.type == 'Literal')
      if (typeof e.expression.value == 'string') {

        // Parse our the directirves
        var m = e.expression.value.match(/^akom\s*([\w\-]+):\s*(.*)/);
        if (m) {
          var what = m[2].split(/\s+/);

          // Handle directives
          switch (m[1]) {
            case 'require':
              requires = requires.concat(what);
              break;
            case 'provide':
              provides = provides.concat(what);
              break;
            case 'no-require':
              noRequires = noRequires.concat(what);
              break;
            case 'no-provide':
              noProvides = noProvides.concat(what);
              break;
          }
        }
      }
    }
  }

  // And now we walk the walk
  walk(ast, requires, provides);

  // Strip out blacklist
  requires = requires.filter(function(x) { return noRequires.indexOf(x) == -1 });
  provides = provides.filter(function(x) { return noProvides.indexOf(x) == -1 });

  // Uniquify
  var temp = requires;
  requires = {};
  for (var i=0; i<temp.length; i++)
    requires[temp[i]] = true;
  temp = provides;
  provides = {};
  for (var i=0; i<temp.length; i++)
    provides[temp[i]] = true;

  // Requires holds things that might be in provides, so we fix that
  for (var i in provides)
    delete requires[i];

  // Turn back into arrays
  temp = requires;
  requires = [];
  for (var i in temp)
    requires.push(i);
  temp = provides;
  provides = [];
  for (var i in temp)
    provides.push(i);

  return {
    requires: requires,
    provides: provides
  };

};
