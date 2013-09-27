var acorn = require('acorn')
  , _analyze = require('../lib/analyze')
  ;

var bodyRe = /^function\s*\(\)\s*{\s*([\s\S]*?)\s*}$/;
var analyze = function(f) {
  return _analyze(acorn.parse(f.toString().match(bodyRe)[1], {
    locations: true
  }));
};

exports.testDirectiveRequire = function(test) {
  test.deepEqual(analyze(function() {
    'akom require: foo bar';
  }), {
    provides: [],
    requires: ['foo', 'bar']
  });

  test.done();
};

exports.testDirectiveProvide = function(test) {
  test.deepEqual(analyze(function() {
    'akom provide: foo bar';
  }), {
    provides: ['foo', 'bar'],
    requires: []
  });

  test.done();
};

exports.testDirectiveRequireWithProvidesSelf = function(test) {
  test.deepEqual(analyze(function() {
    'akom require: foo';
    'akom provide: foo bar';
  }), {
    provides: ['foo', 'bar'],
    requires: []
  });

  test.done();
};


exports.testGlobalVariableProvides = function(test) {
  test.deepEqual(analyze(function() {
    var a = 1;
  }), {
    provides: ['a'],
    requires: []
  });

  test.done();
};

exports.testBasicRequires = function(test) {
  test.deepEqual(analyze(function() {
    b + 1;
  }), {
    provides: [],
    requires: ['b']
  });

  test.done();
};

exports.testBasicRequiresInIIFE = function(test) {
  test.deepEqual(analyze(function() {
    (function() { return b })();
  }), {
    provides: [],
    requires: ['b']
  });

  test.done();
};

exports.testNestedRequires = function(test) {
  test.deepEqual(analyze(function() {
    a.b + 1;
  }), {
    provides: [],
    requires: ['a', 'a.b']
  });

  test.done();
};

exports.testNestedProvides = function(test) {
  test.deepEqual(analyze(function() {
    a.b = 1;
  }), {
    provides: ['a.b'],
    requires: ['a']
  });

  test.done();
};

exports.testDeeplyNestedProvides = function(test) {
    test.deepEqual(analyze(function() {
    a.b.c.d.e.f = 1;
  }), {
    provides: ['a.b.c.d.e.f'],
    requires: ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e']
  });

  test.done();
};

exports.testDeeplyNestedRequires = function(test) {
    test.deepEqual(analyze(function() {
    a.b.c.d.e.f();
  }), {
    provides: [],
    requires: ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e', 'a.b.c.d.e.f']
  });

  test.done();
};

// Discovered in the wild by the crazy "all the module systems"
// declaration style.
exports.testIIFEWithVariable = function(test) {
  test.deepEqual(analyze(function() {
    (function() {
      var a;
    })();
  }), {
    provides: [],
    requires: []
  });

  test.done();
};
