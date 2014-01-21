var memberWalker = module.exports = function(root) {
  var node = root;
  var propStack = [];
  var fullyChained = true;
  var expressions = [];

  for (var node = root; node.type == 'MemberExpression'; node = node.object) {
    if (!node.computed && (node.object.type == 'Identifier' || node.object.type == 'MemberExpression')) {// if (node.property.type == 'Identifier') {
      propStack.unshift(node.property.name)
    } else {
      fullyChained = false;
      propStack = [];
    }

    if (node.computed || node.property.type != 'Identifier')
      expressions.push(node.property);
  }
  if (node.type == 'Identifier')
    propStack.unshift(node.name);
  else
    expressions.push(node);

  var output = [];
  while (propStack.length) {
    output.unshift(propStack.join('.'));
    propStack.pop();
  }

  return {
    output: output,
    fullyChained: fullyChained,
    expressions: expressions
  };
};
