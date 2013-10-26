var acorn = require('acorn')
  , _analyze = require('../lib/analyze')
  ;

var bodyRe = /^function\s*\(\)\s*{\s*([\s\S]*?)\s*}$/;
var analyze = function(f, show) {
  var parsed = acorn.parse(f.toString().match(bodyRe)[1], { locations: true });
  if (show)
    console.log(JSON.stringify(parsed, null, 2));
  return _analyze(parsed);
};

var test = function(name, f) {
  var spec = {requires: [], provides: []};

  exports[('test ' + name)] = function(test) {
    test.deepEqual(analyze(f), spec);
    test.done();
  };

  var ret =  {
    requires: function() { spec.requires = Array.prototype.slice.call(arguments); return ret; },
    provides: function() { spec.provides = Array.prototype.slice.call(arguments); return ret; }
  };
  return ret;
};

/////////////////////////////////////////////////////
// Contrived Tests
/////////////////////////////////////////////////////

test('directive require', function() {
  'akom require: foo bar';
})
.requires('foo', 'bar');

test('directive provide', function() {
  'akom provide: foo bar';
})
.provides('foo', 'bar');

test('directive require with provides self', function() {
  'akom require: foo';
  'akom provide: foo bar';
})
.provides('foo', 'bar');

test('global variable provides', function() {
  var a = 1;
})
.provides('a');

test('basic requires', function() {
  b + 1;
})
.requires('b');

test('basic requires in IIFE', function() {
  (function() { return b })();
})
.requires('b');

test('nested requires', function() {
  a.b + 1;
})
.requires('a', 'a.b');

test('nested provides', function() {
  a.b = 1;
})
.provides('a.b')
.requires('a');

test('deeply nested provides', function() {
  a.b.c.d.e.f = 1;
})
.provides('a.b.c.d.e.f')
.requires('a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e');

test('deeply nested requires', function() {
  a.b.c.d.e.f();
})
.requires('a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e', 'a.b.c.d.e.f');

test('many provides', function() {
  a.b = {};
  a.b.c = {};
  a.b.c.d = {};
  a.b.c.d.e = {};
})
.requires('a')
.provides('a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e');

test('typeof', function() {
  typeof a == 'string';
});

test('function expression argument', function() {
  var a = function(b) {
    return b;
  };
})
.provides('a');

test('function declaration argument', function() {
  (function() {
    function foo(b) { return b; };
  })();
});

test('function argument to IIFE', function() {
  (function(f) {})(function(a) {
    var b;
  });
});

test('if condition typeof', function() {
  if (typeof foo != 'undefined') {
    foo += 1;
  }
});

test('typeof in and', function() {
  typeof foo != 'undefined' && foo();
});

test('typeof in or', function() {
  typeof foo == 'function' || foo();
});

test('typeof in ternary', function() {
  typeof foo == 'undefined' ? null : foo();
});

test('if condition fail typeof', function() {
  if (typeof foo == 'undefined')
    foo += 1;
})
.requires('foo');

test('if condition typeof conditional definition', function() {
  if (typeof a == 'undefined')
    a = 'yay';
}).provides('a');

test('in scope member', function() {
  (function() {
    var a = {};
    a.b = {};
    a.b.c = {};
    return a.b.c;
  })();
});

test('in scope member usage', function() {
  (function() {
    var a = {};
    a.b = {};
    a.b.c = {};
    a.b.d += 1;
    return a.b.c;
  })();
});

///////////////////////////////////////
// Regression Tests
///////////////////////////////////////

// Derived from an in the wild UMD-style delcaration
test('IIFE with variable', function() {
  (function() {
    var z;
  })();
})
;
