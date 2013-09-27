var meetsAny = function(require, provide) {
  for (var i=0; i<provide.length; i++)
    if (require.indexOf(provide[i]) != -1)
      return true;

  return false;
};

module.exports = function(file, specs) {

  // Be flexible and support object form
  if (!(specs instanceof Array))
    specs = Object.keys(specs).map(function(k) { return specs[k] });

  // Clone specs so that we can modify it at will
  specs = specs.slice();

  // If the file is specified by string, attempt to pull it out of
  // the array of files.
  if (typeof file == 'string') {
    for (var i=0; i<specs.length; i++) {
      if (specs[i].path == file) {
        file = specs[i];
        break;
      }
    }
  }
  if (typeof file == 'string')
    throw new Error("File to resolve was passed as a path string (" + file + "), but no file with that path was present in specs.");

  // This bit is used to check what dependencies we have yet to resolve
  var unmetDependencies = {};
  var unmetCount = 0;
  for (var i=0; i<file.require.length; i++) {
    if (!unmetDependencies[file.require[i]]) {
      unmetCount++;
      unmetDependencies[file.require[i]] = true;
    }
  }

  // First, generate a short list of files that provide the requirements
  // we have.  We'll need to track the dependencies of the dependencies
  // as well.
  var activeFiles = [];
  var toRemove = [];
  while (unmetCount != 0) {
    toRemove = [];

    // Run through each available dependency looking for any that resolve
    // our unmet list.
    specs.forEach(function(spec) {

      // Skip dependencies we've already
      if (meetsAny(file.require, spec.provide)) {
        // Add to our list of active dependencies
        activeFiles.push(spec);

        // Mark down the dependencies we've resolved
        for (var i=0; i<spec.provide.length; i++) {
          unmetDependencies[spec.provide[i]] = false;
          unmetCount--;
        }

        // Add any dependencies we need to resolve
        for (var i=0; i<spec.require.length; i++) {
          if (unmetDependencies[spec.require[i]] === undefined) {
            unmetDependencies[spec.require[i]] = true;
            unmetCount++;
          }
        }

        // Mark this spec for deletion from the unused list
        toRemove.push(spec);
      }
    });

    // Remove any of the specs we're newly using
    if (toRemove.length) {
      toRemove.forEach(function(r) {
        specs.splice(specs.indexOf(r), 1);
      });

    // If the entire path through the available dependencies failed
    // to add anything, then we've got an unmet dependency issue.
    } else {
      var unmet = [];
      for (var i in unmetDependencies)
        if (unmetDependencies[i])
          unmet.push(i);
      throw new Error('Unmet dependencies ' + unmet.join(', '));
    }
  }

  // Delegate down to the native sorting algorithm, which is O(good) and
  // and takes care of being clever for us.  The sort we use is simple:
  //
  //  * `a > b` if b provides some or all of a's requires
  //  * `a < b` if a provides some of all of b's requires
  //  * `a == b` if a provides none of b's requires and b provides none of a's requires
  //  * circular dep if a provides some of b's requires and b provides some of a's requires
  activeFiles.sort(function(a, b) {
    var aProvides = meetsAny(b.require, a.provide);
    var bProvides = meetsAny(a.require, b.provide);

    if (!aProvides && !bProvides)
      return 0;
    if (aProvides && !bProvides)
      return -1;
    if (!aProvides && bProvides)
      return 1;

    throw new Error('Circular dependency between ' + a.path + ' and ' + b.path);
  });

  return activeFiles;
};
