var cheerio = require("cheerio")
var request = require("request")
require('ssl-root-cas').inject();
var fs = require("fs")

module.exports =  {
	"scrape": scrape,
	"doTheDo": doTheDo,
	"allDone" : allDone
}

function scrape(f) {
	request("https://mlh.io/seasons/eu-2018/events", function(err, response, html){
		if (err || response.statusCode != 200) {
			console.log("error lol");
		}

		var $ = cheerio.load(html);
		var titles = $(".inner")
		hacks = []

		titles.each(function(i, inner){
			location = $("p", inner).eq(1)
			
			dateStr = $("p", inner).eq(0).text()
			month = dateStr.split(" ")[0]
			r = /(\d+)/g
			start_day = r.exec(dateStr)[0]
			end_day_m = r.exec(dateStr)
			if (end_day_m == undefined) {
				end_day = start_day;
			} else {
				end_day = end_day_m[0]
			}
			
			hacks.push({
				"title": $("h3", inner).text(),
				"start_date": {
					"day" : start_day,
					"month": month
				},
				"end_date": {
					"day": end_day,
					"month": month
				},
				"splash" : $("div.image-wrap>img", inner).attr("src"),
				"logo" : $("div.event-logo>img", inner).attr("src"),
				"address_local": $("div>span", inner).eq(0).text(),
				"address_region": $("div>span", inner).eq(1).text()
			})
		})

		f(hacks)
	})	
}
var allHacks = []

function doTheDo() {
	scrapeHackaphonCom(0, complete, allDone);
}
 
function allDone() {
	return allHacks
}

function complete(hacks, page_num, all_done) {
	console.log("Got " + hacks.length + " hackaphons; total" + allHacks.length)
	allHacks = allHacks.concat(hacks)
	for (var i = 0; i < hacks.length; i++) {
		h = hacks[i]
		console.log(h.title)
	}
	if (hacks.length == 0) {
		// Done scraping
		console.log("DONE")
		all_done()
	} else {
		scrapeHackaphonCom(page_num + 1, complete, all_done)
	}
}

function scrapeHackaphonCom(page_num, f, all_done) {
	request({"rejectUnauthorized" : false,
			 "url": "https://www.hackathon.com/theme/industry?%24skip=" + page_num * 10
	}, function(err, response, html){
		$  = cheerio.load(html)
		hacks = []
		var hackaphons = $(".ht-eb-card")
		hackaphons.each(function(i, hack) {
			date_container = $(".ht-eb-card__left>.ht-eb-card__date", hack)

			start_day = $(".date--start>.date__day", date_container).text()
			start_month = $(".date--start>.date__month", date_container).text()
			end_day = $(".date--end>.date__day", date_container).text()
			end_month = $(".date--end>.date__month", date_container).text()

			title = $(".ht-eb-card__title", hack).text()
			location_url = $(".ht-eb-card__location", hack).attr("href")
			if (location_url == undefined) {
				address_local = undefined;
				address_region = undefined;
			} else {
				location_parts = location_url.split("/").reverse()
				address_local = location_parts[0]
				address_region = location_parts[1]
			}

			logo_link = $(".ht-eb-card__banner", hack).attr("style").replace("background-image: url(", "").replace(")", "")
			hacks.push({
				title: title, 
				start_date: {
					day: start_day,
					month: start_month,
					year: 2018
				},
				end_date: {
					day: start_day,
					month: start_month,
					year: 2018
				},
				splash: logo_link,
				logo: logo_link,
				address_local: address_local,
				address_region: address_region
			})
		})

		f(hacks, page_num, all_done)

	})
}