var Service, Characteristic;
var axios = require('axios');

// The value property of LockCurrentState must be one of the following:
// Characteristic.LockCurrentState.UNSECURED = 0;
// Characteristic.LockCurrentState.SECURED = 1;
// Characteristic.LockCurrentState.JAMMED = 2;
// Characteristic.LockCurrentState.UNKNOWN = 3;

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-gatestrike', 'gatestrike', GatestrikeAccessory);
};

class GatestrikeAccessory {
    constructor(log, config) {
        this.log = log;
        this.name = config['name'];
        this.unlockurl = config['unlockurl'];
        this.unlockduration = config['unlockduration'];
        this.port = config['listenport'];
        
        this.state = Characteristic.LockCurrentState.SECURED; //default is secured on an electric strike

        this.axiosHeaderConfig = {headers:{
            'Content-Type':'application/json',
            'Accept':'application/json'
        }};

        this.lockService = new Service.LockMechanism(this.name);
        this.lockService
            .getCharacteristic(Characteristic.LockCurrentState)
            .on('get', (callback)=>this.getState(callback));

        this.lockService
            .getCharacteristic(Characteristic.LockTargetState)
            .on('get', (callback)=>this.getState(callback))
            .on('set', (state, callback)=>this.setState(state, callback));

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
        this.log('pushing that an unlock event was received');
        this.setState(Characteristic.LockCurrentState.UNSECURED,null);
    }

    getState(callback) {
        callback(null, this.state);
    }

    async setState(state, callback) {
        this.log('receieved request to set state to '+state+' current state is '+this.state);
        if(state!=this.state) {
            try {
                this.log('setting state by '+this.unlockurl);
                var response = await axios.get(this.unlockurl,this.axiosHeaderConfig);
                this.log(response.data);
                if(response.status == 200 || response.status == 204) {
                    this.state=Characteristic.LockCurrentState.UNSECURED;
                    this.lockService.setCharacteristic(Characteristic.LockCurrentState, this.state);
                    setTimeout(()=>{
                        this.log('timeout expired, relocking');
                        this.state=Characteristic.LockCurrentState.SECURED;
                        this.lockService.setCharacteristic(Characteristic.LockCurrentState, this.state);
                    },1000*this.unlockduration); //will return to locked status after duration expires
                    callback(null,this.state);
                }
                else
                    throw(response.statusCode);
            }
            catch (err) {
                this.log('error communicating with lock '+err);
                this.state=Characteristic.LockCurrentState.UNKNOWN;
                callback(err,this.state);
            }
        }
        else {
            this.log('state set matches current');
            this.lockService.setCharacteristic(Characteristic.LockCurrentState, this.state);
            callback(null,this.state);
        }
    }

    getServices() {
        return [this.lockService];
    }

}
