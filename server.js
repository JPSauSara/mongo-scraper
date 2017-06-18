
// Dependencies:

	// Snatches HTML from URLs
	const request = require("request");
	// Scrapes our HTML
	const cheerio = require("cheerio");

// First, tell the console what this server.js is doing
console.log("\n******************************************\n" +
            "Grabbing every article headline and link\n" +
            "from the US Soccer website:" +
            "\n******************************************\n");

// Making a request call or ussoccer.com's homepage
request("http://www.ussoccer.com/", (error,response,html) => {

	// Load the body of the HTML into cheerio
	const $ = cheerio.load(html);

	// Empty array to save our scraped data
	const result = [];

	// With cheerio, find each div-tag with the class "pod-summary"
	$("div.pod-summary").each((i, element) => {

		const summary = $(element).find("span").text();

		result.push({
			summary: summary,
		});
	});


// After the program scans each div.pod-summary, log the result
console.log(result);

});