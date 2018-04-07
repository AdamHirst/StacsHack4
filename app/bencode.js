var cheerio = require("cheerio")
var request = require("request")

module.exports =  {
	"scrape": scrape
}

function scrape(f) {
	request("https://mlh.io/seasons/eu-2018/events", function(err, response, html){
		if (err || response.statusCode != 200) {
			console.log("error lol");
		}

		var $ = cheerio.load(html);
		$(".inner>h3").children()
		var titles = $(".inner")
		hacks = []

		titles.each(function(i, inner){
			location = $("p", inner).eq(1)
			hacks.push({
				"title": $("h3", inner).text(),
				"date": $("p", inner).eq(0).text(),
				"splash" : $("div.image-wrap>img", inner).attr("src"),
				"logo" : $("div.event-logo>img", inner).attr("src"),
				"address_local": $("div>span", inner).eq(0).text(),
				"address_region": $("div>span", inner).eq(1).text()
			})
		})

		f(hacks)
	})	
}