var logger = require('winston')
  , usage = require('usage');


// Setup child a child (worker) process
exports.setup = function() {
  // Handle incomming messages from master
  process.on('message', handleMessage);

  logger.log('info', 'A child now runs pid#%s', process.pid);
  return true;
}


// Got message from master
//
// @param {Object} Message with key `key`
function handleMessage(msg) {
  if (msg && typeof msg === 'object' && 'key' in msg) {
    switch (msg.key) {
      case 'fetch-health':
        // Handle next time there's free resources.
        // This is also a speed indicator.
        process.nextTick(function() {
          fetchHealth(msg.startBench, process.send);
        });
        break;
    }
  }
}

// Reports current process health
// Includes benchmark start time if given by master
//
// @params {Array} benchmark start object (or will be created now)
function fetchHealth(startBench, callback) {
  getCpuUsage(process, done);

  function done(cpuUsage) {
    var memoryUsage = process.memoryUsage();
    var report = {
      key: 'health-report',
      pid: process.pid,
      memoryHeapUsed: memoryUsage.heapUsed,
      memoryHeapTotal: memoryUsage.heapTotal,
      memoryRss: memoryUsage.rss,
      uptime: process.uptime()/86400,
      cpuUsage: cpuUsage,
      startBench: startBench || process.hrtime()
    }
    process.send(report)
  }
}

function getCpuUsage(process, callback) {
  var cpuUsage = null;
  usage.lookup(process.pid, function(err, result) {
    if (result && 'cpu' in result) cpuUsage = result.cpu;
    callback(cpuUsage);
  });
}
