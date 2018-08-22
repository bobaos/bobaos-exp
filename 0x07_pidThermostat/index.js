const BdsdClient = require('bdsd.client');
const MyThermostat = require('mythermostat');

// BdsdClient function accepts socket filename as an argument.
// If no argument provided then it will try to connect to following file:
// process.env['XDG_RUNTIME_DIR'] + '/bdsd.sock'. Usually it is /run/user/1000/bdsd.sock.
let myClient = BdsdClient();

myClient.on('connect', _ => {
  console.log('client connected');
});

// Register listener for broadcasted values
myClient.on('value', data => {
  // console.log('broadcasted value', data);
});

myClient.on('error', console.log);

let currentTempDatapoint = 0;
let setpointDatapoint = 92;

let conditionerDatapoints = {
  power: 1,
  mode: 2,
  fan: 3,
  setpoint: 4
};

let heaterDatapoints = {
  setpoint: 92,
  power: 101,
  fan: 102
};

let accessoryDatapoints = {
  CurrentHeatingCoolingState: 501,
  TargetHeatingCoolingState: 502,
  CurrentTemperature: 504,
  TargetTemperature: 505
};

let myThermostat = MyThermostat();

let init = async _ => {
  console.log('init');
  let current = (await myClient.getStoredValue(currentTempDatapoint)).value;
  let target = (await myClient.getStoredValue(setpointDatapoint)).value;
  await myClient.setValue(accessoryDatapoints.CurrentTemperature, current);

  myClient.on('value', async payload => {
    let id = payload.id;
    let value = payload.value;
    if (id === accessoryDatapoints.TargetHeatingCoolingState) {
      switch (value) {
        case 0:
          // off
          myThermostat.TargetHeatingCoolingState = 'off';
          break;
        case 1:
          myThermostat.TargetHeatingCoolingState = 'heat';
          break;
        case 2:
          myThermostat.TargetHeatingCoolingState = 'cool';
          break;
        case 3:
          myThermostat.TargetHeatingCoolingState = 'auto';
          break;
        default:
          break;
      }
    }
    if (id === accessoryDatapoints.TargetTemperature) {
      myThermostat.TargetTemperature = value;
      await myClient.setValue(heaterDatapoints.setpoint, value);
      await myClient.setValue(conditionerDatapoints.setpoint, value);
    }
    if (id === accessoryDatapoints.CurrentTemperature) {
      myThermostat.CurrentTemperature = value;
    }
  });
  myThermostat.on('output', async payload => {
    let mode = payload.mode;
    let pid = payload.value;
    let values = [];
    let current = myThermostat.CurrentTemperature;
    let target = myThermostat.TargetTemperature;

    switch (mode) {
      case 'heat':
        values.push({id: heaterDatapoints.power, value: true});
        values.push({id: conditionerDatapoints.power, value: false});
        values.push({id: heaterDatapoints.setpoint, value: target});
        break;
      case 'cool':
        values.push({id: heaterDatapoints.power, value: false});
        values.push({id: conditionerDatapoints.power, value: true});
        values.push({id: conditionerDatapoints.setpoint, value: target});
        values.push({
          id: conditionerDatapoints.fan,
          value: pid < 128 ? pid : 255
        });
        break;
      case 'off':
        break;
      default:
        break;
    }
    console.log(mode, values);
    await myClient.setValues(values);
  });
};

myClient.once('connect', init);
