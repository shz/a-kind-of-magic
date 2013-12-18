// TODO - Handle wildcards in the dependency resolution loop and ordering loop

//
// Util
//
var getWildCard = function(s) {
  var r = s.match(/(.+)\.\*$/);
  if (r)
    return new RegExp('^' + r[1].replace(/\./g, '\\.') + '\\..+$');
  else
    return false;
};

//
// Gather an unsorted list of dependencies to resolve the given file
//
var gather = function(file, available) {

  // Util

  var meetsAny = function(spec) {
    for (var i=0; i<spec.provide.length; i++) {
      // Check against unmet
      if (unmet[spec.provide[i]])
        return true;

      // Check against wildcards
      for (var j=0; j<wildcards.length; j++)
        if (spec.provide[i].match(wildcards[j]))
          return true;
    }

    return false;
  };

  var addFile = function(spec) {
    var i = available.indexOf(spec);
    if (i >= 0) {
      files.push(spec);
      available.splice(available.indexOf(spec), 1);
    }
    spec.require.forEach(function(r) {
      var wildcard = getWildCard(r);
      if (wildcard) {
        wildcards.push(wildcard);
      } else if (!unmet.hasOwnProperty(r)) {
        unmet[r] = true;
      }
    });
    spec.provide.forEach(function(p) {
      unmet[p] = false;
    });
  };

  // State
  var wildcards = [];
  var unmet = {};
  var toAdd = [];
  var files = [];
  available = available.slice(); // We want to modify this list

  // Bootstrap
  addFile(file);

  // Do the initial pass, and then keep attempting to meet unmet
  // dependencies if we add any new files.
  do {
    // Reset the toAdd list
    toAdd = [];

    // Check all available dependencies to see if they satisfy an unmet
    // or wildcard.
    available.forEach(function(spec) {
      if (meetsAny(spec))
        toAdd.push(spec);
    });

    // Walk through the files we're about to add.  Add them to the files
    // list and remove them from the available list.
    for (var i=0; i<toAdd.length; i++)
      addFile(toAdd[i]);

    // Clear the wildcard list.  We've already done a run across all
    // files for this set of wildcards, so there's no need to keep
    // processing them in the future.
    wildcards = [];

  } while (toAdd.length);

  // Once we're done, make sure we met all dependencies we set out to
  var unmetProps = [];
  for(var i in unmet) if (unmet.hasOwnProperty(i)) {
    if (unmet[i])
      unmetProps.push(i);
  }
  if (unmetProps.length > 0)
    throw new Error('The following dependencies were unmet: ' + unmetProps.join(' '));

  return files;
};

//
// Sorts dependencies into inclusion order.  Does not modify the list;
// returns a new one.
//
var sort = function(files) {
  // Util
  var meetsAny = function(require, provide) {
    for (var r=0; r<require.length; r++) {
      var wildcard = getWildCard(require[r]);

      for (var p=0; p<provide.length; p++) {
        if (wildcard) {
          if (provide[p].match(wildcard))
            return true;
        } else if (provide[p] == require[r]) {
          return true;
        }
      }
    }

    return false;
  };

  //  * `a > b` if b provides some or all of a's requires
  //  * `a < b` if a provides some of all of b's requires
  //  * `a == b` if a provides none of b's requires and b provides none of a's requires
  //  * circular dep if a provides some of b's requires and b provides some of a's requires
  var comp = function(a, b) {
    var aProvides = meetsAny(b.require, a.provide);
    var bProvides = meetsAny(a.require, b.provide);

    // console.log('AAA');
    // console.log(a.path, b.path);
    // console.log('a provides', aProvides);
    // console.log('b provides', bProvides);

    if (!aProvides && !bProvides)
      return 0;
    if (aProvides && !bProvides)
      return -1;
    if (!aProvides && bProvides)
      return 1;

    throw new Error('Circular dependency between: ' + a.path + ', ' + b.path);
  };

  // Crappy naive sort.  I don't think this even behaves correctly
  // all the time, and our comparison algorithm is super expensive.
  // There are a lot of specific optimizations we can add here.
  var newList = files.slice();
  // for (var i=0; i<newList.length; i++) {
  //   for (var j=i+1; j<newList.length; j++) {
  //     if (comp(newList[i], newList[j]) > 0) {
  //       var temp = newList[i];
  //       newList[i] = newList[j];
  //       newList[j] = temp;
  //     }
  //   }
  // }
  newList.sort(comp);
  return newList;
};

module.exports = function(file, specs) {

  // Be flexible and support object form
  if (!(specs instanceof Array))
    specs = Object.keys(specs).map(function(k) { return specs[k] });

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

  // Gather the list of files we'll need
  var files = gather(file, specs);

  // Sort em into the right order
  files = sort(files);

  return files;
};
