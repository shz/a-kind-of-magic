var estraverse = require('estraverse')
  , escope = require('escope')
  ;

var go = exports.go = function(ast) {
  var require = [];
  var provide = [];
  var noRequire = [];
  var noProvide = [];

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
              require = require.concat(what);
              break;
            case 'provide':
              provide = provide.concat(what);
              break;
            case 'no-require':
              noRequire = noRequire.concat(what);
              break;
            case 'no-provide':
              noProvide = noProvide.concat(what);
              break;
          }
        }
      }
    }
  }

  // Strip out blacklist
  require = require.filter(function(x) { return noRequire.indexOf(x) == -1 });
  provide = provide.filter(function(x) { return noProvide.indexOf(x) == -1 });

  return {
    require: require,
    provide: provide
  };

};