const BdsdClient = require('bdsd.client');

// BdsdClient function accepts socket filename as an argument. 
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

myClient.on('connect', _ => {
  console.log('client connected');

  // invert datapoint value as fast as possible
  let sw = _ => {
    myClient
      .getValue(9)
      .then(payload => {
        myClient
          .setValue(payload.id, !payload.value)
          .then(_ => {
            console.log(`switching datapoint ${payload.id} to ${!payload.value} successful`);
            sw();
          })
          .catch(console.log);
      })
      .catch(console.log);
  };
  sw();
});

// Register listener for broadcasted values
myClient.on('value', data => {
  // console.log('broadcasted value', data);
});
