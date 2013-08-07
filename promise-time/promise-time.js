var Q = require('q');
var _ = require('lodash');

var promiseTime = function () {
    this.timers = {};
};

promiseTime.prototype._getCurrentTimeMs = function () {
    return (new Date()).getTime();
};

promiseTime.prototype.startTime = function (id) {
    this.timers[id] = {
        id: id,
        startTime: this._getCurrentTimeMs(),
        description: ''
    };
    // Always return a resolved promise to make
    // sure we can easily use the non-promise functions
    // to start a promise chain
    return Q.resolve();
};

promiseTime.prototype.startTimePromise = function (id) {
    var _this = this;
    return function (resolvedPromise) {
        _this.startTime(id);
        // Pass on the resolvedPromise so we can put this in an existing chain
        return Q.resolve(resolvedPromise);
    };
}

promiseTime.prototype.endTime = function (id, description) {
    if (!(id in this.timers)) {
        throw new Error('Tried to end timer that does not exist', id);
    }
    var timer = this.timers[id];
    timer.endTime = this._getCurrentTimeMs();
    timer.description = description || '';
    timer.totalTime = timer.endTime - timer.startTime;

    return Q.resolve();
};

promiseTime.prototype.endTimePromise = function (id, description) {
    var _this = this;
    return function (resolvedPromise) {
        _this.endTime(id, description);
        // Pass on the resolvedPromise so we can put this in an existing chain
        return Q.resolve(resolvedPromise);
    }
};

promiseTime.prototype.printReport = function (resolvedPromise) {
    var sortedTimers = _.sortBy(this.timers, function (timer) {
        return timer.endTime;
    });
    var reportLines = _.map(sortedTimers, function (timer) {
        return '[' + timer.id + ' ' + timer.totalTime + 'ms] ' + timer.description;
    });
    console.log('\nPerformance report');
    console.log(reportLines.join('\n'));
    return Q.resolve(resolvedPromise);
};

promiseTime.prototype.reset = function (resolvedPromise) {
    this.timers = {};
    return Q.resolve(resolvedPromise);
};

module.exports = promiseTime;