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

            cb(null, JSON.parse(body));
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
        console.log(country + ': ' + query);

        request(options, function(err, response, body) {
            if (err) return cb(err);
            console.log(body);
            body = JSON.parse(body);
            if (body.Places) {

            if (body.Places.length < 1) {
                return cb(new Error("No place for string"));
            }
                cb(null, body.Places[0].PlaceId);
            } else {
                cb(new Error('API error'));
            }
        });
    },

    getCountries: (cb) => {
        const url = `${apiBase}/reference/v1.0/countries/en-US?apiKey=${apiKey}`;

         var options = {
            url: url,
            headers: {
                'Accept': 'application/json'
            }
        };

        request(options, function(err, response, body) {
            if (err) return cb(err);

            body = JSON.parse(body);
            
            cb(null, body.Countries);
        });

    },
    getReferralLink: (market, origin, destination, outboundDate, inboundDate, cb) => {
        return `${apiBase}/referral/v1.0/${market}/GBP/en-US/${origin}/${destination}/${outboundDate}/${inboundDate}?apiKey=${apiKey}`;
    }
    
}