# Run server
```sh
node server.js
```

# Manual test run:
```sh
statsHost=127.0.0.1 statsPort=8082 statsPath=/stats ./munin_nodejs_uptime config
statsHost=127.0.0.1 statsPort=8082 statsPath=/stats ./munin_nodejs_uptime suggest
statsHost=127.0.0.1 statsPort=8082 statsPath=/stats ./munin_nodejs_uptime
```

# Test run using [munin-run](https://munin.readthedocs.org/en/latest/reference/munin-run.html):
1) Create a symlink munin_nodejs_uptime in the munin plugin directory:
```sh
sudo ln -s $(pwd)/../lib/munin_nodejs_ /etc/munin/plugins/munin_nodejs_uptime
```

2) run the plugin using munin-run:
```sh
munin-run --sconffile munin.conf munin_nodejs_uptime config
munin-run --sconffile munin.conf munin_nodejs_uptime suggest
munin-run --sconffile munin.conf munin_nodejs_uptime
```

3) If you would like to enable the plugin for production usage don't forget to add
config section from munin.conf to [plugin configs in munin](https://munin.readthedocs.org/en/latest/reference/directories.html#pluginconfdir)
and restart the munin-node process.