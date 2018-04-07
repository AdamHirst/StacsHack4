// Routes - Project routes
var ben = require("./bencode.js")
var hacks = []
ben.scrape(doneScraping);

function doneScraping(h) {
	hacks = h;
}

module.exports = (app) => {

    // Index page
    app.get('/', (req, res) => {
        res.render('index', { hackathons: hacks })
    });

    app.get('/hackathons', (req, res) => {
        res.send({ hackathons: hacks });
    });

}