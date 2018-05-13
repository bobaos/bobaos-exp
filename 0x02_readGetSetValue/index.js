const BdsdClient = require('bdsd.client');

// BdsdClient function accepts socket filename as an argument. 
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

myClient.on('connect', _ => {
  console.log('client connected');
  // get all dpts
  myClient
    .getDatapoints()
    .then(payload => {
      console.log('All configured datapoints:');
      payload.forEach(t => {
        let f = t.flags;
        let output = `#${t.id} [${t.dpt}], priority: ${f.priority}, flags:`;
        output += `${f.communication ? 'C' : '_'}${f.read ? 'R' : '_'}`;
        output += `${f.write ? 'W' : '_'}${f.transmit ? 'T' : '_'}`;
        console.log(output);
        // send readRequests. should have update flag configured
        if (f.update) {
          myClient
            .readValue(t.id)
            .catch(console.log);
        }
      });
    });

  // invert datapoint value every ~second
  let sw = _ => {
    myClient
      .getValue(9)
      .then(payload => {
        myClient
          .setValue(payload.id, !payload.value)
          .then(_ => {
            console.log(`switching datapoint ${payload.id} to ${!payload.value} successful`);
            setTimeout(sw, 1000);
          })
          .catch(console.log);
      })
      .catch(console.log);
  };
  sw();
});

// listen to incoming values
myClient.on('value', _ => {
  let {id, value} = _;
  console.log(`#${id} has been changed to ${value}`);
  // now some conditions
  if (id === 42) {
    myClient.setValue(43, !value)
      .then(_ => {
        console.log(`switching datapoint ${_.id}: success`);
      })
      .catch(console.log);
  }
});