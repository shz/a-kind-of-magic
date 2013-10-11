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
Scope.prototype.has = function(name) {
  for (var i in this) if (this.hasOwnProperty(i))
    for (var j=0; j<this[i].length; j++)
      if (this[i][j][name])
        return true;

  return false;
};
