const BdsdClient = require('bdsd.client');
let KlicDI = require('./KlicDI.js');

// BdsdClient function accepts socket filename as an argument.
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

myClient.on('connect', _ => {
  console.log('client connected');
  myConditioner.getState().then(console.log);
});

// Register listener for broadcasted values
myClient.on('value', data => {
  // console.log('broadcasted value', data);
});

myClient.on('error', console.log);

let myConditioner = KlicDI({
  bdsd: myClient,
  power_control: 120,
  mode_control: 122,
  fan_control: 123,
  setpoint_control: 121,
  power_status: 124,
  mode_status: 126,
  fan_status: 127,
  setpoint_status: 125,
  internal_error_state: 128,
  internal_error_code: 129,
  external_error_state: 130,
  external_error_code: 131,
  internal_temperature: 132
});

myConditioner.on('state', console.log);
