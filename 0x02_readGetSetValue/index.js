const BdsdClient = require('bdsd.client');

// BdsdClient function accepts socket filename as an argument. 
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

myClient.on('connect', _ => {
  console.log('client connected');
  
  // invert datapoint value every second
  setInterval( _ => {
    console.log('switching datapoint');
    myClient
    .getValue(9)
    .then(payload => {
            myClient
              .setValue(payload.id, !payload.value)
	      .then(_ => { console.log(`switching datapoint ${payload.id} successful` )})
	      .catch(console.log);
    })
    .catch(console.log);
  }, 1000);
});

// Register listener for broadcasted values
myClient.on('value', data => {
  // console.log('broadcasted value', data);
});
