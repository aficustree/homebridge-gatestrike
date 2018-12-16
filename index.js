var Service, Characteristic;
var axios = require('axios');

/**
 * Service "Switch"
 

Service.Switch = function(displayName, subtype) {
    Service.call(this, displayName, '00000049-0000-1000-8000-0026BB765291', subtype);
  
    // Required Characteristics
    this.addCharacteristic(Characteristic.On);
  
    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.Name);
  };

*/

/**
 * Characteristic "On"

Characteristic.On = function() {
    Characteristic.call(this, 'On', '00000025-0000-1000-8000-0026BB765291');
    this.setProps({
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
  };
  
*/

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-switches6', 'homebridge-switches6', SwitchAccessory);
};

class SwitchAccessory {
    constructor(log, config) {
        this.log = log;
        this.name = config['name'];
        this.onURL = config['onURL'];
        this.offURL = config['offURL'];
        this.statusURL = config['statusURL'];
        this.port = config['listenport'];

        this.axiosHeaderConfig = {headers:{
            'Content-Type':'application/json',
            'Accept':'application/json'
        }};

        this.state = this.getState(null);

        this.switchService = new Service.Switch(this.name);
        this.switchService
            .getCharacteristic(Characteristic.On)
            .on('get', (callback)=>this.getState(callback))
            .on('set', (callback, state)=>this.setState(callback, state));

        try {
            this.listener = require('http').createServer((req, res)=>this.httpListener(req, res));
            this.listener.listen(this.port);
            this.log('listening on port '+this.port);
        }
        catch (err) {
            this.log(err);
        }

    }
    
    httpListener(req, res) {
        var data = '';
		
        if (req.method == 'POST') {
            req.on('data', (chunk) => {
                data += chunk;
            });		
            req.on('end', () => {
                this.log('Received notification and body data:');
                this.log(data.toString());
            });
        }	
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end();
        // TODO: Get state, compare to homekit state, push changes
    }

    async getState(callback) {
        this.log('received request to get state, current known state: '+this.state);
        try {
            var response = await axios.get(this.statusURL,this.axiosHeaderConfig);
            if((response.status == 200 || response.status == 204) && (typeof response.data == typeof true)) {
                this.log('received state of '+response.data);
                this.state=response.data;
            }
            else
                throw(response.statusCode);
            callback(null, this.state);
        }
        catch (err) {
            this.log('error communicating with lock '+err);
            this.state=false;
            callback(err,this.state);
        }
    }

    async setState(state, callback) {
        this.log('receieved request to set state to '+state+' current state is '+this.state);
        if(state!=this.state) {
            try {
                var url;
                state ? url=this.onURL : url=this.offURL;
                this.log('setting state by '+url);
                var response = await axios.get(url,this.axiosHeaderConfig);
                if(response.status == 200 || response.status == 204) {
                    this.state=state;
                    this.switchService.updateCharacteristic(Characteristic.On, this.state);
                    callback(null,this.state);
                }
                else
                    throw(response.statusCode);
            }
            catch (err) {
                this.log('error communicating with lock '+err);
                this.state=false;
                callback(err,this.state);
            }
        }
        else {
            this.log('state set matches current');
            this.switchService.updateCharacteristic(Characteristic.On, this.state);
            callback(null,this.state);
        }
    }

    getServices() {
        return [this.switchService];
    }

}
