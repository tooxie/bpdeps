// hold stats until Munin requests then, then drop them
// similar to StatsD, that pushes to Graphite, this just waits passively for Munin to fetch

// for some reason config here is undefined, ...
module.exports = function(config) {
  if (typeof config === 'undefined') throw new Error("Need to pass configuration to munin-catcher");
  
  var stats = require('./lib/munin-stats');

  stats.server = require('./lib/munin-server')(config, stats);
  
  return stats;
};

