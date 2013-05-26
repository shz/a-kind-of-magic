var parse = require('./parse')
  ;

// TODO - Deal with error handling in this file

var processFile = function(ast) {
  // Temp
  return ast;
};

exports.scan = function() {
  if (arguments.length < 2)
    throw new Error('Must supply at least one path to scan, and a callback');

  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();

  var results = {};
  var outstanding = 0;
  for (var i=0; i<args.length; i++) {
    outstanding++;

    parse.go(args[i], function(err, js) {
      if (!err)
        for (var k in js)
          results[k] = processFile(js[k]);

      if (--outstanding == 0) {
        callback(js);
      }
    });

  }
};