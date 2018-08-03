let bdsd;
let device;

let Humidifier = params => {
  let self = {};
  bdsd = params.bdsd;
  self.device = params.device;

  self.datapoints = {};
  self.datapoints.setpoint = params.setpoint;
  self.datapoints.current = params.current;
  self.values = {};
  self.getValues = async _ => {
    self.values.current = (await bdsd.getStoredValue(self.datapoints.current)).value;
    self.values.setpoint = (await bdsd.getStoredValue(self.datapoints.setpoint)).value;

    return self.values;
  };

  self.onValueChange = async _ => {
    let values = await self.getValues();
    if (values.current > values.setpoint) {
      // TODO: turn off
      self.device.setProductivity(0);
    } else {
      // TODO: turn on
      self.device.setProductivity(99);
    }
  };
  // register listener
  bdsd.on('value', payload => {
    if (payload.id === self.datapoints.current || payload.id === self.datapoints.setpoint) {
      self
        .onValueChange()
        .then()
        .catch(console.log);
    }
  });
  // setPollingInterval
  setInterval(_ => {
    bdsd
      .readValue(self.datapoints.current)
      .then(_ => {})
      .catch(e => {console.log('bad while reading', e)});
  }, 60000);

  return self;
};

module.exports = Humidifier;