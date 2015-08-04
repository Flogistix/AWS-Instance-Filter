/* jshint laxcomma:true */
const
  R = require ('ramda'),

  logI = function (x) { console.log (x); return x; },

  nil = null;
(function main (args) {
  var json = '';

  process.stdin.on ('data', function (d) { json += d.toString(); });
  process.stdin.on ('end',  function (d) {
    const
      instances = JSON.parse (json),
      getReservations = R.prop ('Reservations'),
      getInstances = R.prop ('Instances'),
      isPriam = R.pipe ( R.map (R.prop ('Tags'))
                       , R.map (R.compose (R.map (R.test (new RegExp(args[2],'gi'))), R.map (R.prop ('Value'))))
                       , R.flatten
                       , R.contains (true));

    const getFilteredInstances = R.compose (R.flatten, R.filter (isPriam), R.map (getInstances), getReservations);

    getIpAddressesOfPriams = R.compose (R.unnest, R.map (R.map (R.prop ('PrivateIpAddress'))), R.map (R.prop ('NetworkInterfaces')), getFilteredInstances);

    console.log (JSON.stringify (getIpAddressesOfPriams (instances)));
  });
})(process.argv);

