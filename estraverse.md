# Notes on the estraverse API

Call `estraverse.traverse` with an object that has the following methods:

 * `enter` - Called when entering a node
 * `leave` - Called when leaving a node

Both of these methods have the following signature: `function(node, parent)`.
Note that `parent` can be null in some situations.

The `enter` function may control the traversal by returning the
following values:

 * `estraverse.VisitorOption.Skip` - Skips walking child nodes of this node. The
                                     `leave` function wil *still* be called.
 * `estraverse.VisitorOption.Break` - Ends it all

The `leave` function can also control the traversal by returning
the following values:

 * `estraverse.VisitorOption.Break` - Ends it all

# Example

The following code will output all variables declared
at the root of a file.

```javascript
estraverse.traverse(ast, {
  enter: function(node, parent) {
    if (node.type == 'FunctionExpression')
      return estraverse.VisitorOption.Skip;
  },
  leave: function(node, parent) {
    if (node.type == 'VariableDeclarator')
      console.log(node.id.name);
  }
});
