var estraverse = require('estraverse')
  ;

module.exports = function(node, state) {
  estraverse.traverse(node, {enter: function(node, parent) {

    if (node.type == 'FunctionDeclaration' || node.type == 'VariableDeclarator')
      state.scope.add('function', node.id.name);

    // Don't walk into inner lexical scopes
    if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression')
      return estraverse.VisitorOption.Skip;
  }});
};
