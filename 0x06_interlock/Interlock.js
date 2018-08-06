let bdsd;

let Interlock = params => {
  bdsd = params.bdsd;

  let self = {};

  self.input = params.input;
  self.outputs = params.outputs.slice();
  bdsd.on('value', payload => {
    let id = payload.id;
    let value = payload.value;

    if (id === self.input) {
      let values = [];
      self.outputs.forEach((t, i) => {
        if (i !== value) {
          values.push({id: t, value: false});
        }
      });
      values.push({id: self.outputs[value], value: true});
      console.log(values);
      bdsd.setValues(values).catch(console.log);
    }
  });
};

module.exports = Interlock;
