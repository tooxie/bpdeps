// run an HTTP server to dump the stats to munin
// @TODO make this a telnet server not http!!

// config should contain 'statsPath' and 'statsPort'
module.exports = function(config, statsHandler) {
  var express = require('express');
  var server = express();

  if (typeof config.statsPath === 'undefined') {
    throw new Error("Config is missing 'statsPath'");
  }
  
  server.use(express.favicon());    // don't dump graphs when browser requests!
  
  // get list of available graphs
  server.get(config.statsPath + '/graphs', function(req, res) {
    res.send(statsHandler.getGraphKeys());
  });
  
  // get a particular graph's info
  server.get(config.statsPath + '/:graphKey?', function(req, res) {
    
    // munin requesting a graph? dump all graph info [and maybe reset]
    if (typeof req.params.graphKey !== 'undefined') {

      // - reset? 
      var reset = (typeof req.query.reset !== 'undefined' && req.query.reset === '1');    

      res.send(statsHandler.dumpMuninStats(req.params.graphKey, reset));
    }
    // or other request to show plain stats? just display.
    else {
      res.send(statsHandler.getStats());
    }
  });

  server.listen(config.statsPort, config.statsHost, function(){
    console.log("Initialized munin stats server:", this.address().address, 'port', this.address().port);
  });
  
  return server;
};