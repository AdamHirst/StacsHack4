// Routes - Project routes
var ben = require("./bencode.js")
var hacks = [];
var needsUpdate = true;

const updateHackathons = (cb) => {
    needsUpdate = false;

    ben.scrape(hackathons => {
        hacks = hackathons;
        
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

const adam = require('./adamcode.js');

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
    })

}