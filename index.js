/* jshint laxcomma:true */
const
  R = require ('ramda'),
  Maybe = require ('data.maybe'),

  toMaybe = function (x) {
    if (R.isNil (x)) { return Maybe.Nothing (); }
    return Maybe.Just (x);
  },

//maybesToList :: [Maybe a] -> [a]
  maybesToList = function (xs) {
    return xs.filter (R.prop ('isJust'))
             .map    (function (m) { return m.get(); });
  },

//maybeProp :: String -> Maybe a
  maybeProp = R.compose (toMaybe, R.prop),

  logI = function (x) { console.log (x); return x; },

  nil = null;
(function main (args) {
  var json = '';

  process.stdin.on ('data', function (d) { json += d.toString(); });
  process.stdin.on ('end',  function (d) {
    const
      instances       = JSON.parse (json),
      getReservations = R.prop ('Reservations'),
      getInstances    = R.prop ('Instances'),

    //getMatchingTags :: Tag -> [Maybe Bool]
      getMatchingTags = R.pipe ( R.map (maybeProp ('Value'))                          // [Maybe String]
                               , R.map (R.map (R.test (new RegExp(args[2], 'gi'))))), // [Maybe Bool]
            


      isMatching = R.pipe ( R.map (maybeProp ('Tags'))      // [Maybe [Tag]]
                          , R.map (R.map (getMatchingTags)) // [Maybe [Maybe Bool]]
                          , R.map (R.map (maybesToList))    // [Maybe [Bool]]
                          , maybesToList                    // [[Bool]]
                          , R.flatten                       // [Bool]
                          , R.contains (true)),

      getFilteredInstances = R.pipe ( getReservations
                                    , R.map    (getInstances)
                                    , R.filter (isMatching)
                                    , R.flatten ),

      getIpAddressesOfMatching = R.pipe ( getFilteredInstances
                                        , R.map (R.prop ('NetworkInterfaces'))
                                        , R.map (R.map (R.prop ('PrivateIpAddress')))
                                        , R.unnest );

    console.log (JSON.stringify (getIpAddressesOfMatching (instances)));
  });
})(process.argv);

