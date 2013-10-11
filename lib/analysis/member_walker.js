var memberWalker = module.exports = function(root) {
  var node = root;
  var propStack = [];
  var fullyChained = true;

  for (var node = root; node.type == 'MemberExpression'; node = node.object) {
    if (node.property.type == 'Identifier') {
      propStack.unshift(node.property.name)
    } else {
      fullyChained = false;
      propStack = [];
    }
  }
  if (node.type == 'Identifier')
    propStack.unshift(node.name);

  var output = [];
  while (propStack.length) {
    output.unshift(propStack.join('.'));
    propStack.pop();
  }

  return { output: output, fullyChained: fullyChained };
};
