usage: run.js [-h] --browser {chromium,gecko,webkit} [--host1 HOST1]
              [--host2 HOST2] [--port PORT] [--verbose]
              [browser-cmd ...]

Test if a browser profile has cost-of-privacy interventions enabled.

positional arguments:
  browser-cmd           Argument to use to launch the browser. Note that this
                        should include all arguments and flags that should be
                        used to launch the browser. To avoid issues with "--"
                        prefixed arguments to pass to the browser, use "--",
                        followed by the full browser command. So, for example:
                        ./run.js --host1 me.local -- /Applications/Brave\
                        Browser\ Nightly.app/Contents/MacOS/Brave\ Browser\
                        Nightly --user-data-dir=/tmp (default: undefined)

optional arguments:
  -h, --help            show this help message and exit
  --browser {chromium,gecko,webkit}
                        Which browser family is being tested. (default:
                        undefined)
  --host1 HOST1         The first host to use to connect to the test server.
                        This host should be an alias for "localhost".
                        (default: localhost)
  --host2 HOST2         The second host to use to connect to the test server.
                        This host should be an alias for "localhost," and must
                        be different that the --host1 argument. (default:
                        127.0.0.1)
  --port PORT           The port for the test server to listen on. (default:
                        8080)
  --verbose, -v         Print verbose execution information. (default: false)
