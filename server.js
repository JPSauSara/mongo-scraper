
	// Dependencies:
	const express = require("express");
	const bodyParser = require("body-parser");
	const logger = require("morgan");
	const mongoose = require("mongoose");

	// Requiring our Comment and Article models
	const Comment = require("./models/Comment.js");
	const Article = require("./models/Article.js");

	// Require request and cheerio. This makes the scraping possible
	// Snatches HTML from URLs
	const request = require("request");
	// Scrapes our HTML
	const cheerio = require("cheerio");

	// Set mongoose to leverage built in JavaScript ES6 Promises
	mongoose.Promise = Promise;

// First, tell the console what this server.js is doing
console.log("\n******************************************\n" +
            "Grabbing every article headline and link\n" +
            "from the US Soccer website:" +
            "\n******************************************\n");

// Initialize Express
	const app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended:false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scrapersoccer");
const db = mongoose.connection;

// Show any mongoose errors
db.on("error", (error) => {
	console.log("Mongoose Error: ", error);
});

// Once logged into the db through mongoose, log a sucess message
db.once("open", () => {
	console.log("Mongoose connection successful.");
});




// Main route (simple  Hello World Message)
app.get("/", (req, res) => {
	res.send("Hello World");
});

// Retrieve data from the db
app.get("/articles", (req, res) => {
	db.scrapedData.find({}, (error, found) => {
		// Throw any errors to the console
		if (error) {
			console.log (error);
		}
		// If there are no errors, send the data to the browser as a json
		else {
			res.json(found);
		}
	});
});


// Scrape data from one site and place it into the mongodb db
app.get ("/scrape", (req, res) => {

	// Making a request call or ussoccer.com's homepage
	request("http://www.ussoccer.com/", (error,response,html) => {

		// Load the body of the HTML into cheerio
		const $ = cheerio.load(html);

		// Empty array to save our scraped data
		// const result = [];

		// With cheerio, find each div-tag with the class "pod-summary"
		$("div.pod-summary").each((i, element) => {

			const summary = $(element).find("span").text();

			// If this title element had both a title and a link
			if (summary) {
				// Save the data in the scrapedData db
				db.scrapedData.save({
					summary: summary,
				}, (error, saved) => {
					// If there's an error during this query
					if (error) {
						console.log(error);
					}
					else {
						console.log(saved);
					}
				});
			}

			// result.push({
			// 	summary: summary,
		});
	});

	// This will send a "Scrape Complete" message to the browser
	res.send("Scrape Complete");
});

// Listen on port 3000
app.listen(3000, ()=> {
	console.log("App running on port 3000!");
});



// After the program scans each div.pod-summary, log the result
// console.log(result);

// });