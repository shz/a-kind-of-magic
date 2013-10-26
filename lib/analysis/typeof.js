var estraverse = require('estraverse')
  ;

// Ease of use...
var SKIP = estraverse.VisitorOption.Skip;
var BREAK = estraverse.VisitorOption.Break;

//
// Supported forms:
//
//   typeof foo == 'undefined' // TODO
//   typeof foo != 'undefined' // TODO
//   window.foo == 'undefined' // TODO
//   window.foo != 'undefined' // TODO
//   a.b.foo == 'undefined'    // TODO
//   a.b.foo != 'undefined'    // TODO
//
//
// Description TODO
//
exports.handle = function(root, state) {
  estraverse.traverse(root, {
    enter: function(node, parent) {

    }
  });
}

//
// Returns true if we're able to successfully run handle() on
// the result of this predicate expression.
//
exports.understands = function(node) {
  return node.type == 'BinaryExpression'
      && (node.operator == '==' || node.operator == '!=')
      && ((node.left.type == 'UnaryExpression' && node.left.operator == 'typeof')
         || (node.right.type == 'UnaryExpression' && node.right.operator == 'typeof'))
      ;
};
