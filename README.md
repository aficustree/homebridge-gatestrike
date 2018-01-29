# homebridge-gatestrike

This plugin controls an electric strike interfaced with a Raspberry Pi via a GPIO-controlled relay module. 

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install homebridge-sss-platform using: `npm install -g git+https://github.com/aficustree/homebridge-gatestrike`
3. Update your configuration file. See [sample-config.json](./sample-config.json) in this repository for a sample. 

## Configuration

Please see the `sample-config.json` for details on how to configure. 

```
"accessories": [
    {
        "accessory": "homebridge-gatestrike",
        "name": "Front Gate",
        "unlockduration": 10,
        "unlockurl": "http://YOURIP:YOURPORT/YOURPATH",
        "listenport": 8900
    }
]
```

1. *accessory* - must be homebridge-gatestrike
2. *name* - whatever you want to name your accessory
3. *unlockduration* - how long does your gatestrike remain unlocked on a trigger
4. *unlockurl* - assumes an HTTP GET to a URL to trigger the unlock event
5. *listenport* - by default, the system will listen for connections on the defined port. this allows the system to register a trigger that happens outside of homekit (i.e., someone pushes a door release button)

## License

Copyright 2018, [aficustree](https://github.com/aficustree)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the [License](./LICENSE).

