var cluster = require('cluster')
  , exitSignals = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT']
  , healthCheckInterval = 60 * 100
  , numCPUs = require('os').cpus().length
  , logger = require('winston')
  , stats = require('./munin');

// Setup master process
exports.setup = function () {
  // Make sure everything get's shut down
  exitSignals.forEach(function(signal) {
    process.on(signal, function() { exit(signal) });
  });

  // Setup munin reports
  stats.setup(require('munin'));

  // Let's milk the CPU :)
  for(var i = 0; i < numCPUs; i++) spawnWorker(true);

  // Setup graphs for collecting data from all children
  stats.setupGraphs(getWorkerPids());

  // Bind events
  cluster.on('exit', checkDeath);

  // Fetch health-report from clusters every `healthCheckInterval`
  setInterval(healthCheck, healthCheckInterval);

  logger.log('info', 'Master now runs pid#%d', process.pid);

  return true;
}

// Exit all spawned workers
//
// @param {String} Signal of death
function exit(signal) {
  forEachWorker(function(worker) {
    logger.log('info', '  Killing worker pid#%d with `%s`', worker.process.pid, signal);
    worker.kill(signal);
  });
  process.exit();
}

// Check wether death was on purpose
// Respawn if it was accidential
//
// @param {Object} Worker
// @param {Object} Code
// @param {Object} Signal
function checkDeath(worker, code, signal) {
  logger.log('info', '  Worker pid#%d killed by `%s`', worker.process.pid, signal || null);
  if (worker.suicide)
    logger.log('info', '        by committing suicide.');
  else {
    logger.log('error', '        something went wrong. Respawning..');
    spawnWorker();
  }
}

// Aks all children for their health status
function healthCheck() {
  forEachWorker(function(worker) {
    worker.send({ key: 'fetch-health', benchStart: process.hrtime() });
  });
}

// For each worker do ...
function forEachWorker(callback) {
  for (var id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}

// Get all active pids (and use `map` in the future!)
function getWorkerPids() {
  var pids = [];
  forEachWorker(function(worker) {
    pids.push(worker.process.pid);
  });
  return pids;
}

// Setup worker for messaging
function spawnWorker(initial) {
  var worker = cluster.fork();
  worker.on('message', handleMessage)

  // Probably reinizalize graphs if the worker was failing...
  if (!initial) stats.setupGraphs(getWorkerPids());

  return worker;
}

// Got message from worker
//
// @param {Object} Message with key `key`
//
// **Note: context is in worker!!**
function handleMessage(msg) {
  if (typeof msg == 'string') {
    switch (msg) {
      case 'app-load-error':
        exit('SIGTERM');
        break;
    }
  } else if (msg && typeof msg === 'object' && 'key' in msg) {
    switch (msg.key) {
      case 'health-report':
        msg.responseTime = diffBench(msg.startBench);

        // Report health report
        stats.report(msg)

        break;
    }
  }
}

// Calculate response time for benchmark
function diffBench(start) {
  var diffBench = process.hrtime(start);
  // Get nanoseconds between startBench and endBench
  return diffBench[0] * 1e9 + diffBench[1];
}
