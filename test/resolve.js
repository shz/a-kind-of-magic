var resolve = require('../lib/resolve');

exports.testSupportsObject = function(test) {
  var file = {
    provide: [],
    require: ['a']
  };
  var specs = {
    'asdf': {
      path: 'asdf',
      provide: ['a'],
      require: []
    }
  };

  var output = resolve(file, specs);
  test.equal(output.length, 1, 'Resolve worked');
  test.done();
};

exports.testSupportsSpec = function(test) {
  var specs = {
    'asdf': {
      path: 'asdf',
      provide: ['a'],
      require: []
    }
  };

  var output = resolve(specs.asdf, specs);
  test.equal(output.length, 1, 'Resolve worked');
  test.done();
}

exports.testSupportsFileAsPathString = function(test) {
  var specs = {
    'asdf': {
      path: 'asdf',
      provide: ['a'],
      require: []
    }
  };

  var output = resolve('asdf', specs);
  test.equal(output.length, 1, 'Resolve worked');
  test.done();
};

exports.testUnmet = function(test) {
  var file = {
    provide: [],
    require: ['unmet', 'met']
  };
  var specs = [
    {
      path: 'a',
      provide: ['met'],
      require: []
    }
  ];

  test.throws(function() {
    resolve(file, specs);
  });
  test.done();
};

exports.testDependencyHasUnmet = function(test) {
  var file = {
    provide: [],
    require: ['met']
  };
  var specs = [
    {
      path: 'a',
      provide: ['met'],
      require: ['unmet']
    }
  ];

  test.throws(function() {
    resolve(file, specs);
  });
  test.done();
};

exports.testResolution = function(test) {

  var file = {
    provide: [],
    require: [ 'foo'
             , 'bar'
             , 'baz'
             , 'bam'
             ]
  };
  var specs = [
    {
      path: 'last',
      provide: ['bam'],
      require: ['baz', 'bar']
    },
    {
      path: 'first',
      provide: ['foo', 'baz'],
      require: []
    },
    {
      path: 'second',
      provide: ['bar'],
      require: ['foo']
    }
  ];

  var output = resolve(file, specs);

  test.equal(output[0].path, 'first', 'First file is correct');
  test.equal(output[1].path, 'second', 'Second file is correct');
  test.equal(output[2].path, 'last', 'Third file is correct');

  test.done();
};

exports.testCircularDetection = function(test) {

  var file = {
    provide: [],
    require: ['a', 'b']
  };
  var specs = [
    {
      path: 'a',
      provide: ['a'],
      require: ['b']
    },
    {
      path: 'b',
      provide: ['b'],
      require: ['a']
    }
  ];

  test.throws(function() {
    resolve(file, specs);
  });

  test.done();
};

exports.testWildcardResolution = function(test) {
  var file = {
    provide: [],
    require: ['a.*']
  };
  var specs = [
    {
      path: 'foo',
      provide: ['a.foo', 'a.bar'],
      require: []
    },
    {
      path: 'bar',
      provide: ['a.baz'],
      require: ['c']
    },
    {
      path: 'bam',
      provide: ['c'],
      require: []
    }
  ];

  var output = resolve(file, specs);

  test.equal(output[0].path, 'foo', 'Second file is correct');
  test.equal(output[1].path, 'bam', 'Third file is correct');
  test.equal(output[2].path, 'bar', 'Third file is correct');

  test.done();
};
