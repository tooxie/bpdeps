nodejs-munin
============

A [Munin](http://munin-monitoring.org) stats catcher & plugin for node.js applications.
Allows node.js apps to collect stats and report them on-demand to a [Munin](http://munin-monitoring.org) node.

Inspired by [StatsD](https://github.com/etsy/statsd). StatsD uses Graphite, but I had an existing Munin-based graph infrastructure, so this works with Munin.

By [Ben Buckman, New Leaf Digital](http://newleafdigital.com)

Installation
============

For the most fresh versions you may want to use:
```sh
npm install git://github.com/newleafdigital/nodejs-munin.git
```

Latest stable version can be installed using:
```sh
npm install munin
```

Example
=======
Uptime example is in the [example](https://github.com/newleafdigital/nodejs-munin/tree/master/example) directory.
