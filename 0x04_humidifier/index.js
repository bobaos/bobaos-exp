const BdsdClient = require('bdsd.client');
const Humidifier = require('./humidifier');
const Carel = require('./carelBacnet');

// BdsdClient function accepts socket filename as an argument. 
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

// carel small
let carelSmall = Carel('192.168.4.25');

// humidifiers
let livroomHumidifier = Humidifier({
  setpoint: 134,
  current: 133,
  bdsd: myClient,
  device: carelSmall
});



myClient.on('connect', async _ => {
  console.log('client connected');
  console.log(await livroomHumidifier.getValues());
});

// Register listener for broadcasted values
myClient.on('value', data => {
  // console.log('broadcasted value', data);
});
