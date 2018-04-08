
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GMAPS_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);

module.exports = {
    geocode: (query, cb) => {
        // Using callback
        geocoder.geocode(query, function(err, res) {
            if (err) return cb(null);
            if (res.length == 0) return null;
            cb({
                latitude: res[0].latitude,
                longitude: res[0].longitude,
            });
        });
    }
}