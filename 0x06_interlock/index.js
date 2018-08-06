const BdsdClient = require('bdsd.client');
const Interlock = require('./Interlock.js');
// BdsdClient function accepts socket filename as an argument.
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

myClient.on('connect', _ => {
  console.log('client connected');
});

myClient.on('error', e => {
  console.log('error', e);
});

let myInterlock1 = Interlock({input: 200, outputs: [203, 204], bdsd: myClient});
let myInterlock2 = Interlock({input: 201, outputs: [205, 206], bdsd: myClient});
let myInterlock3 = Interlock({input: 202, outputs: [207, 208], bdsd: myClient});
