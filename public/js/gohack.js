/* GoHack.js */

function ajax(url, cb) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cb(this.responseText);
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

function getGeoString(country, query, cb) {
    var url = `/equivlocale?country=${country}&query=${query}`;
    ajax(url, cb);
}

function getQuotes(market, origin, destination, outboundDate, inboundDate, cb) {
    var url = `/getprice/?market=${market}&origin=${origin}&destination=${destination}&outboundDate=${outboundDate}&inboundDate=${inboundDate}`
    ajax(url, cb);
}

function getLocations(cb) {
    var url = '/hackathons';
    ajax(url, cb);
}