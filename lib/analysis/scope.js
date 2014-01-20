var Scope = module.exports = function() {};

Scope.prototype.add = function(group, name) {
  var g = this[group];
  if (!g)
    g = this[group] = [{}]

  g[g.length-1][name] = true
};
Scope.prototype.push = function(group, obj) {
  var g = this[group];
  if (g)
    g.push({});
  else
    g = this[group] = [obj || {}];
};
Scope.prototype.pop = function(group) {
  var g = this[group];
  if (!g) throw new Error('No group "' + group + '"');

  g.pop();
}
Scope.prototype.has = function(group, name) {
  if (name === undefined) {
    name = group;
    group = undefined;
  }

  if (group) {
    if (this.hasOwnProperty(group))
      for (var j=0; j<this[group].length; j++)
        if (this[group][j][name])
          return true;
  } else {
    for (var i in this) if (this.hasOwnProperty(i))
      for (var j=0; j<this[i].length; j++)
        if (this[i][j][name])
          return true;
  }

  return false;
};
Scope.prototype.list = function(group) {
  var l = [];

  if (this.hasOwnProperty(group))
    for (var i=0; i<this[group].length; i++)
      for (var k in this[group][i]) if (this[group][i].hasOwnProperty(k))
        l.push(k)

  return l;
};
Scope.prototype.global = function() {

};

