var resolve = require('../lib/resolve');

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
    resolve.go(file, specs);
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
    resolve.go(file, specs);
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
      require: ['foo',]
    }
  ];

  var output = resolve.go(file, specs);

  test.equal(output[0].path, 'first', 'First file is correct');
  test.equal(output[1].path, 'second', 'Second file is correct');
  test.equal(output[2].path, 'last', 'Third file is correct');

  test.done();
};

exports.testCirculatDetection = function(test) {

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
    resolve.go(file, specs);
  });

  test.done();
};
