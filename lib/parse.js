var fs = require('fs')
  , nodePath = require('path')
  , acorn = require('acorn')
  ;

var go = module.exports = function(path, callback) {
  fs.stat(path, function(err, stats) {
    if (err) return callback(err);

    // Files we've parsed get added to this
    var js = {};

    // For directories, simply recurse
    if (stats.isDirectory()) {

      // To correctly tell when we can return, we increment
      // this counter every times we make an async call and
      // decrement every time an async call returns.  At the
      // end of every async callback, we check if there are
      // no further outstanding requests, and if not, we're
      // done and return via the original callback.
      var outstanding = 0;
      var maybeFinish = function() {
        if (outstanding == 0) {
          callback(undefined, js);
        }
      };

      // Walk the directory
      outstanding++;
      fs.readdir(path, function(err, files) {
        outstanding--;

        files.forEach(function(file) {
          outstanding++;

          var p = nodePath.join(path, file);
          go(p, function(err, results) {
            outstanding--;

            if (!err) {
              for (var i in results) {
                js[i] = results[i];
              }
            }

            maybeFinish();
          });
        });

        maybeFinish();
      });

    // For files, check that they're javascript and parse away
    } else if (stats.isFile()) {
      if (path.match(/\.js$/)) {
        fs.readFile(path, {encoding: 'utf8'}, function(err, data) {
          if (err) return callback(err);

          // Parse away!
          try {
            js[path] = acorn.parse(data, {
              locations: true,
              sourceFile: path
            });
            return callback(undefined, js);
          } catch (parseErr) {
            return callback(parseErr);
          }
        });
      } else {
        return callback(undefined, js);
      }

    // We don't understand anything else
    } else {
      return callback(new Error(path + ' is not a valid path'));
    }
  });
};
