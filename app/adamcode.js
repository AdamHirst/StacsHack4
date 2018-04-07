// SkyScanner integration

const apiBase = 'http://partners.api.skyscanner.net/apiservices';
const request = require('request');
const apiKey = process.env.SKYSCANNER_KEY;

module.exports = {

    getQuotes: (market, origin, destination, outboundDate, inboundDate, cb) => {
        const url = `${apiBase}/browsequotes/v1.0/${market}/GBP/en-US/${origin}/${destination}/${outboundDate}/${inboundDate}?apiKey=${apiKey}`;

        var options = {
            url: url,
            headers: {
                'Accept': 'application/json'
            }
        };

        request(options, function(err, response, body) {
            if (err) return cb(err);

            cb(null, JSON.parse(body).Quotes);
        });
    },

    getGeolocatedString: (country, query, cb) => {
        const url = `${apiBase}/autosuggest/v1.0/${country}/GBP/en-US?query=${query}&apiKey=${apiKey}`;

        var options = {
            url: url,
            headers: {
                'Accept': 'application/json'
            }
        };

        request(options, function(err, response, body) {
            if (err) return cb(err);

            body = JSON.parse(body);

            console.log(body.Places.length);


            if (body.Places.length < 1) {
                return cb(new Error("No place for string"));
            }

            cb(null, body.Places[0].PlaceId);
        });
    }
    
}