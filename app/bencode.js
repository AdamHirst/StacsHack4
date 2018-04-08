var cheerio = require("cheerio")
var request = require("request")
require('ssl-root-cas').inject();
var fs = require("fs")

module.exports =  {
	"scrape": scrapeAll,
	"scrapeMLH": scrape,
	"scrapeHackathonCom" : scrapeHackathonCom
}

function scrapeAll(cb) {
	scrape(mlhHackathons => {
		scrapeHackathonCom(hackathonCom => {
			mlhHackathons.push(...hackathonCom);

			function comparator(a, b) {
				var aDate = new Date();
				var aD = aDate.setFullYear(a.start_date.year, parseInt(a.start_date.month)-1, a.start_date.day);
				var bDate = new Date();
				var bD = bDate.setFullYear(b.start_date.year, parseInt(b.start_date.month)-1, b.start_date.day);
				return aD > bD ? 1 : -1;
			}

			mlhHackathons.sort(comparator);


			cb(mlhHackathons);
		})
	})
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

			month = getDateNum(month);

			if (month.length == 1) month = '0' + month;

			var aDate = new Date();
			var year = new Date().getFullYear();
			var aD = aDate.setFullYear(year, parseInt(month)-1, start_day);
			if (aD < Date.now()) year = year + 1;

			hacks.push({
				"title": $("h3", inner).text(),
				"start_date": {
					"day" : start_day,
					"month": month,
					"year": year
				},
				"end_date": {
					"day": end_day,
					"month": month,
					"year": year
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

function getDateNum(str) {
	switch (str) {
		case 'Jan': return '01';
		case 'Feb': return '02';
		case 'Mar': return '03';
		case 'Apr': return '04';
		case 'May': return '05';
		case 'Jun': return '06';
		case 'Jul': return '07';
		case 'Aug': return '08';
		case 'Sep': return '09';
		case 'Oct': return '10';
		case 'Nov': return '11';
		case 'Dec': return '12';
	}
}

// https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city/4878797
function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


function formatAddress(address) {
	address = address.replace("-", " ");
	return toTitleCase(address)
}

function scrapeHackathonCom(cb, page_num) {
	if (!page_num) page_num = 0;

	request({"rejectUnauthorized" : false,
			 "url": "https://www.hackathon.com/theme/industry?%24skip=" + page_num * 10
	}, function(err, response, html){
		$  = cheerio.load(html)
		hacks = []
		var Hackathons = $(".ht-eb-card")
		Hackathons.each(function(i, hack) {
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
				address_local = formatAddress(location_parts[0])
				address_region = formatAddress(location_parts[1])
			}

			start_month = getDateNum(start_month);

			if (start_month.length == 1) start_month = '0' + start_month;
			
			var aDate = new Date();
			var year = new Date().getFullYear();
			var aD = aDate.setFullYear(year, parseInt(start_month)-1, start_day);
			if (aD < Date.now()) year = year + 1;

			//console.log(title + ': ' + aD + ', ' + Date.now());
			logo_link = $(".ht-eb-card__banner", hack).attr("style").replace("background-image: url(", "").replace(")", "")
			hacks.push({
				title: title, 
				start_date: {
					day: start_day,
					month: start_month,
					year: year
				},
				end_date: {
					day: start_day,
					month: start_month,
					year: year
				},
				splash: logo_link,
				logo: logo_link,
				address_local: address_local,
				address_region: address_region
			})
		})

		console.log(page_num);

		if (hacks.length != 0) { // More to come?
			scrapeHackathonCom(newHacks => {
				hacks.push(...newHacks);
			}, page_num + 1);
		}

		cb(hacks)

	})
}