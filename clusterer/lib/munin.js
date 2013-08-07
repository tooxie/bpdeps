var config = require('../config/munin')
  , stats;

exports.stats = stats;

// Setup config and describe possible stat-keys
exports.setup = function(munin) {
  stats = munin(config);

  return stats;
}

exports.initStat = function(pid) {
  for (var key in config.statsKeys) {
    stats.initStat(getStatKey(pid, key), { label: 'pid'+pid });
  }
}

exports.setupGraphs = function(pids) {
  for (var key in config.statsKeys) {
    config.statsKeys[key].category = 'nodejs-cluster'
    stats.describeGraph(key, config.statsKeys[key], getStatKeys(pids, key));
  }

  for (var id in pids) {
    var pid = pids[id];
    exports.initStat(pid);
  }
}

// Report any given key to munin stats
exports.report = function(data) {
  for (var key in config.statsKeys) {
    stats.setStat(getStatKey(data.pid, key), data[key]);
  }
}

// Create keys for all pids (and use `map` in the future!)
function getStatKeys(pids, key) {
  var keys = [];
  for (var id in pids) {
    keys.push(getStatKey(pids[id], key));
  }
  return keys;
}

// Create a single key for pid
function getStatKey(pid, key) {
  return 'pid'+pid+'_'+key;
}
