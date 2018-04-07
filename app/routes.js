// Routes - Project routes

module.exports = (app) => {

    // Index page
    app.get('/', (req, res) => {
        res.send('Hello world!');
    });

    app.get('/hackathons', (req, res) => {
        res.send({ hackathons: [] });
    });

}