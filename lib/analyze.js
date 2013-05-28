var estraverse = require('estraverse')
  ;

var go = exports.go = function(ast) {
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

  // And now we walk the walk.
  // NOTE - We have to roll this by hand.  Unfortunately, after
  //        a few experiments with what escope gives us, it's
  //        solidly inadequate :(

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
    require: requires,
    provide: provides
  };

};
