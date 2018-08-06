let EE = require('events');

let bdsd;

let KlicDI = params => {
  let self = new EE();

  self.datapoints = {};
  self.datapoints.powerControl = params.power_control;
  self.datapoints.modeControl = params.mode_control;
  self.datapoints.fanControl = params.fan_control;
  self.datapoints.setpointControl = params.setpoint_control;

  self.datapoints.powerStatus = params.power_status;
  self.datapoints.modeStatus = params.mode_status;
  self.datapoints.fanStatus = params.fan_status;
  self.datapoints.setpointStatus = params.setpoint_status;

  self.datapoints.internalErrorState = params.internal_error_state;
  self.datapoints.internalErrorCode = params.internal_error_code;
  self.datapoints.externalErrorState = params.external_error_state;
  self.datapoints.externalErrorCode = params.external_error_code;

  self.datapoints.internalTemp = params.internal_temperature;

  bdsd = params.bdsd;

  self.setPower = state => {
    return bdsd.setValue(self.datapoints.powerControl, state);
  };

  self.setMode = mode => {
    let modes = [
      {name: 'auto', value: 0},
      {name: 'heating', value: 1},
      {name: 'cooling', value: 3},
      {name: 'fan', value: 9},
      {name: 'dry', value: 14}
    ];
    let searchByMode = t => {
      return t.name === mode;
    };
    let modeIndex = modes.findIndex(searchByMode);
    if (modeIndex > -1) {
      let modeValue = modes[modeIndex].value;

      return bdsd.setValue(self.datapoints.modeControl, modeValue);
    }

    return Promise.reject(new Error('Cannot find mode with given name'));
  };

  self.setFan = value => {
    return bdsd.setValue(self.datapoints.fanControl, value);
  };

  self.setSetpoint = value => {
    return bdsd.setValue(self.datapoints.setpointControl, value);
  };

  self.getState = async _ => {
    let powerStatus = (await bdsd.getStoredValue(self.datapoints.powerStatus))
      .value;
    let modeStatus = (await bdsd.getStoredValue(self.datapoints.modeStatus))
      .value;
    console.log('modeValue: ', modeStatus);
    let modes = [
      {name: 'auto', value: 0},
      {name: 'heating', value: 1},
      {name: 'cooling', value: 3},
      {name: 'fan', value: 9},
      {name: 'dry', value: 14}
    ];
    let searchByModeValue = t => {
      return t.value === modeStatus;
    };
    let modeName = modes.find(searchByModeValue).name;

    let fanStatus = (await bdsd.getStoredValue(self.datapoints.fanStatus))
      .value;
    let setpointStatus = (await bdsd.getStoredValue(
      self.datapoints.setpointStatus
    )).value;
    let internalErrorState = (await bdsd.getStoredValue(
      self.datapoints.internalErrorState
    )).value;
    let internalErrorCode = (await bdsd.getStoredValue(
      self.datapoints.internalErrorCode
    )).value;
    let externalErrorState = (await bdsd.getStoredValue(
      self.datapoints.externalErrorState
    )).value;
    let externalErrorCode = (await bdsd.getStoredValue(
      self.datapoints.externalErrorCode
    )).value;
    let internalTemp = (await bdsd.getStoredValue(self.datapoints.internalTemp))
      .value;

    return {
      power: powerStatus,
      mode: modeName,
      fan: fanStatus,
      setpoint: setpointStatus,
      internal_error_state: internalErrorState,
      internal_error_code: internalErrorCode,
      external_error_state: externalErrorState,
      external_error_code: externalErrorCode,
      internal_temperature: internalTemp
    };
  };

  self.setState = state => {
    return Object.assign(self.state, state);
  };

  self.init = async _ => {
    let state = await self.getState();
  };

  bdsd.on('connect', _ => {
    self
      .getState()
      .then(state => {
        self.state = state;
      })
      .catch(console.log);
  });

  bdsd.on('value', payload => {
    let id = payload.id;
    let value = payload.value;
    if (id === self.datapoints.powerStatus) {
      self.emit('state', self.setState({power: value}));
    }
    if (id === self.datapoints.modeStatus) {
      self.emit('state', self.setState({mode: value}));
    }
    if (id === self.datapoints.fanStatus) {
      self.emit('state', self.setState({fan: value}));
    }
    if (id === self.datapoints.setpointStatus) {
      self.emit('state', self.setState({setpoint: value}));
    }
    if (id === self.datapoints.internalErrorState) {
      self.emit('state', self.setState({internal_error_state: value}));
    }
    if (id === self.datapoints.internalErrorCode) {
      self.emit('state', self.setState({internal_error_code: value}));
    }
    if (id === self.datapoints.externalErrorState) {
      self.emit('state', self.setState({external_error_state: value}));
    }
    if (id === self.datapoints.externalErrorCode) {
      self.emit('state', self.setState({external_error_code: value}));
    }
    if (id === self.datapoints.internalTemp) {
      self.emit('state', self.setState({internal_temperature: value}));
    }
  });

  return self;
};

module.exports = KlicDI;
