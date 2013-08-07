promise-time
============

Library for easy timing of code using `Q` promises
--------------------------------------------------

### Usage ###

```javascript
var promiseTime = require('promise-time');

var timer = new promiseTime();

// Start timer now
timer.startTime('foo');

doSomething()
    .then(doSomethingElse)
    // Start timer `bar` after `doSomethingElse` resolved
    .then(timer.startTimePromise('bar'))
    .then(doSomeMoreStuff)
    // Stop timer `foo` after `doSomeMoreStuff` resolved
    .then(timer.endTimePromise('foo'))
    // Stop timer `bar` after the timer for `foo` resolved
    .then(timer.endTimePromise('bar'))
    // Print report afterwards
    .then(timer.printReport)
    // Do something else if you want to
    .then(whateveryouwanttodo);
```

