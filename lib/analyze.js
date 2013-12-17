var walk = require('./analysis/walk')
  ;

var go = module.exports = function(ast) {
  var requires = [];
  var provides = [];
  var noRequires = [];
  var noProvides = [];
  var skipFile = false;

  // Look for AKOM directives
  if (ast.type == 'Program') {
    for (var i=0; i<ast.body.length; i++) {
      var e = ast.body[i];
      if (e.type == 'ExpressionStatement')
      if (e.expression.type == 'Literal')
      if (typeof e.expression.value == 'string') {

        // Parse our the directirves
        var m = e.expression.value.match(/^akom\s*([\w\-]+)(:\s*(.*)\s*)?$/);
        if (m) {
          var command = m[1];
          var args = m[4] ? m[4].split(/\s+/) : [];

          // Handle directives
          switch (command) {
            case 'require':
              requires = requires.concat(args);
              break;
            case 'provide':
              provides = provides.concat(args);
              break;
            case 'no-require':
              noRequires = noRequires.concat(args);
              break;
            case 'no-provide':
              noProvides = noProvides.concat(args);
              break;
            case 'pass':
              skipFile = true;
              break;
          }
        }
      }
    }
  }

  // And now we walk the walk
  if (!skipFile) {
    walk(ast, requires, provides);
  }

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
