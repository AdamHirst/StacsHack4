// Routes - Project routes
const adam = require('./adamcode.js');
var ben = require("./bencode.js")
var hacks = [];
var needsUpdate = true;
var geostrings = {};
var countries = {};
var validCCodes = [];
var latlngs = {};

// populate countries
adam.getCountries((err, cs) => {
    cs.forEach(country => {
        countries[country.Name.toLowerCase()] = country.Code.toLowerCase();
        validCCodes.push(country.Code.toLowerCase());
    });
});

const updateHackathons = (cb) => {
    needsUpdate = false;
    ben.scrape(hackathons => {
        hacks = hackathons;
        
        hacks.forEach(hackathon => {
            if (geostrings[hackathon.address_local]) {
                hackathon.geoString = geostrings[hackathon.address_local];
            } else {
                if (!hackathon.address_region) {
                    hackathon.geoString = 'PARI-sky';
                } else {
                    var country = hackathon.address_region.toLowerCase().replace('-', ' ');
                    
                    if (country.length > 2) country = countries[country];
                    console.log(validCCodes.includes(country));
                    if (validCCodes.includes(country)) {
                        adam.getGeolocatedString(country.toUpperCase(), hackathon.address_local.toLowerCase().replace('-', ' '), (err, glString) => {
                            geostrings[hackathon.address_local] = glString;
                            hackathon.geoString = glString;
                        });
                    } else {
                        hackathon.geoString = 'PARI-sky';
                    }
                }   
            }
            if (latlngs[hackathon.address_local]) {
                hackathon.location = latlngs[hackathon.address_local];
            } else {
                if (hackathon.address_local && hackathon.address_region) {
                    require('./geocode').geocode(hackathon.address_local.toLowerCase().replace('-', ' ') + ', ' + hackathon.address_region.toLowerCase().replace('-', ' '), (latlng) => {
                        latlngs[hackathon.address_local] = latlng;
                        hackathon.location = latlng;
                    });
                }
            }
        });

        setTimeout(() => {
            needsUpdate = true;
        }, 1000 * 60 * 60);

        cb();
    });
}

const getHackathons = (cb) => {
    if (needsUpdate) updateHackathons(() => {
        cb(hacks);
    }) 
    else {
        cb(hacks);
    }
}


module.exports = (app) => {

    // Index page
    app.get('/', (req, res) => {
        getHackathons(hackathons => {
            res.render('index', { hackathons: hackathons });
        });
    });

    app.get('/hackathons', (req, res) => {
        getHackathons(hackathons => {
            res.send({ hackathons: hackathons });
        });
    });

    app.get('/getprice', (req, res) => {
        if (!req.query.market) {
            res.send("Error! A market is required");
        } else if (!req.query.origin) {
            res.send("Error! An origin is required");
        } else if (!req.query.destination) {
            res.send("Error! A destination is required");
        } else if (!req.query.outboundDate) {
            res.send("Error! An outbound date is required");
        } else if (!req.query.inboundDate) {
            res.send("Error! An inbound date is required");
        } else {
            adam.getQuotes(req.query.market, req.query.origin, req.query.destination, req.query.outboundDate, req.query.inboundDate, (err, quotes) => {
                if (err) res.send(err);
                else {
                    res.send(quotes);
                }
            });
        }
    });

    app.get('/equivlocale', (req, res) => {
        adam.getGeolocatedString(req.query.country, req.query.query, (err, geoString) => {
            if (err) return res.send(err);
            res.send(geoString);
        });
    });

    app.get('/getReferralLink', (req, res) => {
    	 res.send(adam.getReferralLink(req.query.market, req.query.origin, req.query.destination, req.query.outboundDate, req.query.inboundDate));
    });

}