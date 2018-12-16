# homebridge-gatestrike

This plugin provides an ES6 interface to a REST-based controller exposed as a homekit switch. 

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install homebridge-sss-platform using: `npm install -g git+https://github.com/aficustree/homebridge-switchES6`
3. Update your configuration file. See [sample-config.json](./sample-config.json) in this repository for a sample.

## Configuration

Please see the `sample-config.json` for details on how to configure.

```
"accessories": [
    {
        "accessory": "homebridge-switchES6",
        "name": "Fireplace",
        "onURL": "http://YOURIP:YOURPORT/on",
        "offURL":"http://YOURIP:YOURPORT/off",
        "statusURL":"http://YOURIP:YOURPORT/status"
        "listenport": 8900
    }
]
```

1. *accessory* - must be homebridge-gatestrike
2. *name* - whatever you want to name your accessory
4. *unlockurl* - assumes an HTTP GET to a URL to trigger the unlock event
5. *listenport* - by default, the system will listen for connections on the defined port. this allows the system to register a trigger that happens outside of homekit (i.e., someone pushes a door release button)

## Use

Expects three exposed interfaces as noted above. Status returns True or False as valid JSON matching to 'on/off' respectively. On/Off tests for HTTP Status OK or otherwise reports an error. 

## License

Copyright 2018, [aficustree](https://github.com/aficustree)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the [License](./LICENSE).

