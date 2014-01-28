//
// Creates a map of provide name -> [spec]
//
var buildIndex = function(specs) {
  var index = {};

  specs.forEach(function(s) {
    s.provide.forEach(function(p) {
      var list = index[p];
      if (!list)
        list = index[p] = [];

      list.push(s);
    });
  });

  return index;
};

//
// Returns a list of requirements, with wildcard entries expanded
//
var expandRequirements = function(reqs, index) {
  var results = [];

  reqs.forEach(function(req) {
    // Figure out if this is a wildcard
    var r = req.match(/(.+)\.\*$/);

    // If not using a wildcard, just pull the single entry
    if (!r) {
      results.push(req);

    // Otherwise, find all keys matching our pattern and return them
    } else {
      r = new RegExp('^' + r[1].replace(/\./g, '\\.') + '\\..+$');
      return Object.keys(index)
        .filter(function(k) { return !!k.match(r) })
        .forEach(function(k) { results.push(k) })
        ;
    }
  });

  return results;
};

//
// Builds dependency tree for a given root
//
var buildTree = function(root, specs) {
  var idx = buildIndex(specs);
  var cache = {};

  var makeNode = function(spec, parent) {
    var node = cache[spec.path];
    if (node === undefined) {
      node = cache[spec.path] = {
        path: spec.path,
        parents: [],
        children: []
      };

      var requirements = expandRequirements(spec.require, idx);
      for (var i=0; i<requirements.length; i++) {
        var s = idx[requirements[i]];
        if (!s) {
          node = null;
          break;
        }

        var child = null;
        for (var j=0; j<s.length; j++) {
          child = makeNode(s[j], node);
          if (child) break;
        }

        if (child == null) {
          node = null;
          break;
        } else {
          node.children.push(child);
        }
      }
    }

    if (node === null) {
      return null;
    } else if (parent) {
      node.parents.push(parent);
    }

    return node;
  };

  var result = makeNode(root, null);
  if (!result)
    throw new Error('Unresolved dependencies');

  return result;
};

//
// Attempts to resolve
//
var attempt = function(root, specs) {
  var tree = buildTree(root, specs);

  // If there was no possible resolution, bail
  if (!tree) {
    return {
      success: false,
      unresolved: ['TODO']
    };
  }

  // Include order resolution logic
  var order = []; // Final include order
  var walking = {}; // Nodes we're visiting in this walk
  var walk = function(node) {
    // Circular dependency prevention
    if (walking[node.path])
      throw new Error('Circular dependency');

    // Regular nodes - walk children
    if (node.children.length) {
      walking[node.path] = true;
      for (var i=0; i<node.children.length; i++) {
        walk(node.children[i]);
      }
      delete walking[node.path];

      // We're now a leaf -- walk ourselves
      walk(node);

    // Leaf nodes - add to include order and update parent
    } else {
      if (node.path)
        order.push(node.path);
      for (var i=0; i<node.parents.length; i++) {
        var index = node.parents[i].children.indexOf(node);
        if (index >= 0)
          node.parents[i].children.splice(index, 1);
      }
    }
  }

  // Do the resolution
  try {
    walk(tree);
  } catch (err) {
    return {
      success: true,
      circular: walking
    }
  }

  return {
    success: true,
    resolution: order
  }
};

module.exports = function(root, specs) {

  // Support object or arrays for specs
  if (!(specs instanceof Array))
    specs = Object.keys(specs).map(function(k) { return specs[k] });

  // If the root is specified by string, pull the spec out of the
  // specs list.
  if (typeof root == 'string') {
    for (var i=0; i<specs.length; i++) {
      if (specs[i].path == root) {
        root = specs[i];
        break;
      }
    }
  }
  if (typeof file == 'string')
    throw new Error("File to resolve was passed as a path string (" + file + "), but no file with that path was present in specs.");

  // Try to find a resolution
  var result = attempt(root, specs);

  // If we failed, raise an appropriate error
  if (!result.success) {
    var message = "Unknown error";

    if (result.unresolved) {
      message = "Unresolved dependencies:\n  " + result.unresolved.join('\n  ');
    } else if (result.circular) {
      message = "Circular dependency between these files:\n  "
              + result.circular.join('\n  ') + '\n'
              ;
    }

    throw new Error(message);
  }

  // Success
  var map = {};
  specs.forEach(function(s) { map[s.path] = s });
  return result.resolution.map(function(path) { return map[path] });
};
