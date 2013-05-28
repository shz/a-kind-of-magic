# A Kind of Magic

Automatic dependency resolution for Javascript.  Also `akom` for short.

**IMPORTANT NOTE:** I practice Readme Driven Development -- this project is not yet completed!

Currently, the resolver isn't hooked up to the public API, and the only provide/require
gathering implemented is the hardcoded stuff described at the bottom of this readme.  Docs
are also a little lacking, I'm sure you'll agree.

# What it do

This scans all the Javascript files in a directory, and outputs information about
what depends on what, along with a suggested inclusion order.  It's both a library and
a command-line tool.

# Why it do

You're not a compiler.

Assuming you're the average Javascript programmer like me, you follow a sane pattern for assigning to
globals and the like -- a pattern that can be recognized and used by a compiler to do your dependency
management for you.

# How it do

Javascript files are parsed, and global assignments/accesses are recorded.  For example, if a file does

```javascript
window.bar = window.foo + 123;
```

Then the file is known to require `foo` and provide `bar`.  Pretty simple example, but `akom`
goes further: it understands scope, immediately-invoked functions, and all that jazz.

# Installation

```bash
npm install a-kind-of-magic
```

# Usage

You've got two ways to use `akom`: via command line, or as a library.  The library
approach is way more powerful.

## Command Line

This isn't even implemented yet...

## Library

A quick sample:

```javascript
var akom = require('a-kind-of-magic');
akom.scan('some/path', function(err, files) {

});
```

# Avoiding Problems

Provided you *always* access globals by their fully-namespaced identifiers, you're good.

**Good:**
```javascript
my.oh.so.deeply.nested.module.doSomething();
```

**Bad:**
```javascript
var saveTime = my.oh.so.deeply.nested.module.
saveTime.doSomething();
```

Something worth noting as well: conditional blocks (and, well, anything that may or may not
execute) are considered to always pass.  So if you assign to something in an `if` statement,
we're going to assume it always passes.  Same with `switch` statements, `while` loops, etc.

# Fixing Problems

Alas, sometimes you just have to do something obscene that's gonna confuse the analyzer.  So, to
work around this problem you can explicitly declare exports/requirements by putting them in string
expressions at the root of a file.  Like so:

```javascript
'akom require: foo bar baz.bam';
'akom provide: shoo foo.zap';
'akom no-provide: zing';
'akom no-require: zam';
```

The first two statements explicitly add exports/requirements.  The last two statements can be
used to correct `akom` when it doesn't get things right.
