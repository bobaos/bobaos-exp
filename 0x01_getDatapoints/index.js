const BdsdClient = require('bdsd.client');

// BdsdClient function accepts socket filename as an argument. 
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

myClient.on('connect', _ => {
  console.log('client connected');
  myClient
    .getDatapoints()
    .then(payload => {
      console.log('All configured datapoints:');
      console.log(payload.map(t => {
        return {id: t.id, dpt: t.dpt}
      }));
    })
    .catch(console.log);
});
