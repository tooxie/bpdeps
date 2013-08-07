
module.exports = (function() {
  var
    stats = {
      // key: {
      //   config: {},      // for munin
      //   options: {},     // for output
      //   val: N           // value
      // }
    },

    // Date of fetch request (init to current date, since stats are all in memory)
    lastGotStats = new Date(),

    // describe graphs for munin
    graphs = {},
  
    _ = require('underscore'),
    
    mod = {};   // to return


  // initialize a stat and set info for munin
  mod.initStat = function(key, config, options) {

    // (config corresponds to KEY.INFO in munin plugin 'config' output)
    if (typeof config === 'undefined') config = {};
    _.defaults(config, {
      'type' : 'GAUGE',
      'label': key,
      'min': 0
    });

    if (typeof options === 'undefined') options = {};
    _.defaults(options, {
      initialVal: 0,
      resetOnDump: true,
      resetTo: 0
    });

    stats[key] = {
      config: config,
      options: options,
      val: options.initialVal
    };
  };


  // pass in hash of graph info (corresponds to graph_KEY) in munin plugin
  // + array of stats keys that will go in this graph
  // + scaleFunc is optional function to recalc value. e.g. use to scale 5m to 1hr.
  mod.describeGraph = function(key, graphInfo, statsKeys, scaleFunc) {
    graphs[key] = graphInfo;
    graphs[key].stats = statsKeys;

    if (typeof scaleFunc === 'function') graphs[key].scaleFunc = scaleFunc;
  };


  // retrieve the list of graphs
  mod.getGraphKeys = function() {
    return _.keys(graphs);
  };

  // // retrieve the graphs info
  // mod.getGraphsInfo = function(key) {
  //   if (typeof graphs[key] !== 'undefined') return graphs[key];
  //   return null;
  // };

  mod.setStat = function(key, val) {
    if (isNaN(val) || val == null) val = 0;
    if (typeof stats[key] === 'undefined') mod.initStat(key);
    stats[key].val = val;
  };

  mod.incrStat = function(key, by) {
    if (typeof by === 'undefined' || by == null || isNaN(by)) by = 1;
    if (typeof stats[key] == 'undefined') mod.initStat(key);
    stats[key].val += by;
  };

  mod.getStats = function() {
    return stats;
  };

  // get everything munin-fetch needs to send graph data to munin, RESET the stats, (& mark the time)
  // one graph at a time (by graphKey)
  // also run scaleFunc on values if set
  // reset stats if reset=true
  mod.dumpMuninStats = function(graphKey, reset) {
    console.log("Dumping munin stats for", graphKey, '(reset='+reset+')');
    
    var graph = {};
    if (typeof graphs[graphKey] !== 'undefined') {
      graph = _.clone(graphs[graphKey]);
      
      // replace the keys w/ stats (config + values)
      var statsKeys = graph.stats;
      graph.stats = {};
      
      _.each(statsKeys, function(statKey) {
        if (typeof stats[statKey] === 'undefined') {
          return;
        }
        
        var stat = _.clone(stats[statKey]);
        
        // scale values?
        if (!_.isUndefined(graph.scaleFunc)) {
          stat.val = graph.scaleFunc(stat.val);
          // console.log('scaled', statKey, stats[statKey].val, stat.val);
        }
        
        // reset?
        if (reset === true && stat.options.resetOnDump === true) {
          mod.setStat(statKey, stat.options.resetTo);
          // console.log('reset', statKey);
        }
        
        delete stat.options;    // don't need anymore
        
        graph.stats[statKey] = stat;
      });
    }
    return graph;
  };

  mod.getLastGot = function() {
    return lastGotStats;
  };

  mod.timeSinceLastGot = function() {
    // @todo
  };

  return mod;
}());