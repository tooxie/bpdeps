// @todo consolidate munin_nodejs_ (plugin) output w/ this
// for this their logic is duplicated

// pass in the stats handler. returns a bunch of functions.
// each function returns a string to be outputted or saved somewhere
module.exports = function(statsHandler) {
  var mod = {};
  
  
  mod.suggest = function(){
    var graphs = statsHandler.getGraphKeys(), 
        output = '';
    for (var i in graphs) {
      output += graphs[i] + "\n";
    }
    return output;
  };
  
  
  
  mod.config = function(graphKey) {
    var graph = statsHandler.dumpMuninStats(graphKey, false),
        stats = graph.stats,
        output = '';
        
    delete graph.stats;    // rest is graph info
    delete graph.scaleFunc;
    
    for (var key in graph) {
      output += "graph_" + key + " " + graph[key] + "\n";
    }

    for (var statKey in stats) {
      if (typeof stats[statKey].config !== 'undefined') {
        for (var statConfig in stats[statKey].config) {
          output += statKey + "." + statConfig + " " + stats[statKey].config[statConfig] + "\n";
        }
      }
    }
    
    return output;
  };
  
  
  
  mod.values = function(graphKey) {
    var graph = statsHandler.dumpMuninStats(graphKey, false),
        stats = graph.stats,
        output = '';

    delete graph.stats;    // rest is graph info
    
    for (var statKey in stats) {
      output += statKey + ".value " + stats[statKey].val + "\n";
    }
    
    return output;
  };
  
  
  return mod;
};
