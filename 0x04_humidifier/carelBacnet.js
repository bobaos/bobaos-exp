const bacnet = require('bacstack');
const client = new bacnet({adpuTimeout: 6000});

let Carel = ip => {
  let self = {};
  let myDeviceIp = ip;
  self.setProductivity = value => {
    client.writeProperty(
      myDeviceIp,
      {
        type: bacnet.enum.ObjectTypes.OBJECT_POSITIVE_INTEGER_VALUE,
        instance: 15
      },
      bacnet.enum.PropertyIds.PROP_PRESENT_VALUE,
      [
        {
          type: bacnet.enum.ApplicationTags.BACNET_APPLICATION_TAG_UNSIGNED_INT,
          value: 2
        }
      ],
      function (err, res) {
        if (err) {
          console.log(err);

          return;
        }
        // set random productivity value
        client.writeProperty(
          myDeviceIp,
          {type: 2, instance: 13},
          bacnet.enum.PropertyIds.PROP_PRESENT_VALUE,
          [
            {
              type: bacnet.enum.ApplicationTags.BACNET_APPLICATION_TAG_REAL,
              value: Math.round(value)
            }
          ],
          function (err, res) {
            if (err) {
              console.log(err);

            }
          }
        );
      }
    );
  };

  return self;
};

module.exports = Carel;
