const Bdsd = require('bdsd.client');
const storage = require('node-persist');

let watched;

// TODO: get list of watched events
//
//
const init = async _ => {
  try {
    await storage.init();
    watched = await storage.getItem('watched');
    if (typeof watched === 'undefined') {
      watched = [];

      return await storage.setItem('watched', watched);
    }
  } catch (e) {
    throw new Error(`Cannot init node-persist ${e.message}`);
  }
};

const watch = async (status, control) => {
  const findByStatus = t => t.status === status;
  let i = watched.findIndex(findByStatus);
  console.log(watched, i);
  if (i < 0) {
    console.log(`${status} is no wathed, adding`);
    watched.push({status: status, control: control});
    await storage.setItem('watched', watched);
    let value = (await bdsd.getStoredValue(status)).value;
    await storage.setItem(`datapoint_${status}`, value);
  } else {
    console.log(`${status} already watched`);
    let value = (await bdsd.getStoredValue(status)).value;
    await storage.setItem(`datapoint_${status}`, value);
  }
};

const unwatch = async id => {
  const findByStatus = t => t.status === status;
  let i = watched.findIndex(findByStatus);
  if (i > -1) {
    watched.splice(i, 1);
    console.log(`${id} is watched, unwatching`);
    await storage.setItem('watched', watched);
  }
};

const restore = async _ => {
  try {
    watched.forEach(async w => {
      let {status, control} = w;
      let key = `datapoint_${status}`;
      let value = await storage.getItem(key);
      await bdsd.setValue(control, value);
    });
  } catch (e) {
    throw new Error('error while restoring datapoints');
  }
};

let bdsd = Bdsd();

bdsd.on('connect', async _ => {
  console.log('client connected');
  // TODO: read storage for watched events then send to bus values from storage
  //  let datapoints = await
  await init();
  await watch(1, 1);
  await watch(2, 2);
  await watch(3, 3);
  await restore();
});

setInterval(restore, 3000);

// Register listener for broadcasted values
bdsd.on('value', async payload => {
  // console.log('broadcasted value', data);
  let {id, value} = payload;
  let i = watched.indexOf(id);
  if (i > -1) {
    await storage.setItem(`datapoint_${id}`, value);
  }
});
