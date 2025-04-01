usage: run.js [-h] --driver {safari,chrome,firefox} [--binary BINARY]
              [--profile PROFILE] [--host1 HOST1] [--host2 HOST2]
              [--port PORT] [--timeout TIMEOUT]

Test if a browser profile has cost-of-privacy interventions enabled.

optional arguments:
  -h, --help            show this help message and exit
  --driver {safari,chrome,firefox}
                        Which selenium driver "family" to use when automating
                        the browser. (default: undefined)
  --binary BINARY       Path to browser binary to use when running tests. This
                        argument is ignored when using safaridriver. (default:
                        undefined)
  --profile PROFILE     Path to the profile to use when running tests. This
                        argument is ignored when using safaridriver. (default:
                        undefined)
  --host1 HOST1         The host to use for the first server to run checks
                        against. (default: localhost)
  --host2 HOST2         The host to use for the second server to run checks
                        against. (default: 127.0.0.1)
  --port PORT           The port to use for the first server to run checks
                        against. (default: 8080)
  --timeout TIMEOUT     Number of milliseconds to wait between test steps.
                        (default: 3000)
