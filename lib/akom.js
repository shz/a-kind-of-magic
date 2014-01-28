// Browsing through the revision history and wondering WTF this is?
// Well, I'm using this code as my development test case.  Hah.
'akom require: foo bar baz bam';
'akom no-require: foo';

var parse = require('./parse')
  , analyze = require('./analyze')
  , resolve = require('./resolve2')
  ;

// TODO - Deal with error handling in the parsing step

var processFile = function(path, ast) {
  var results = analyze(ast);

  return {
    path: path,
    ast: ast,
    require: results.requires,
    provide: results.provides
  };
};

exports.resolve = function(file, specs) {
  return resolve(file, specs);
};

// scan([file or directory name]..., callback)
exports.scan = function() {
  if (arguments.length < 2)
    throw new Error('Must supply at least one path to scan, and a callback');

  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();

  var results = {};
  var outstanding = 0;
  for (var i=0; i<args.length; i++) {
    outstanding++;

    parse(args[i], function(err, js) {
      if (err) {
        console.log(err.stack || err.message || err);
        // WHAT DO?
      } else {
        for (var k in js)
          results[k] = processFile(k, js[k]);
      }

      if (--outstanding == 0) {
        callback(undefined, results);
      }
    });
  }
};
