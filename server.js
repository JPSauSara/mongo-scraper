
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


// Routes ========================================



// A GET request to scrape data and place it into the mongodb db
app.get ("/scrape", (req, res) => {

	// Making a request call or ussoccer.com's homepage
	request("http://www.espnfc.us/", (error,response,html) => {

		// Load the body of the HTML into cheerio
		const $ = cheerio.load(html);

		// Empty array to save our scraped data
		const docs = [];

		// With cheerio, find each div-tag with the class "first-row"
		$("div.text-content").each((i, element) => {

			// Save an empty result object
			var result = {};

			// Add the text and href of every link, and save them as properties of the result object
			result.title = $(element).children().find("a").text();
			result.link = $(element).find("a").attr("href")

			// Using our Article model, create a new entry
			// This effectively passes the reult object to the entry (and the title and link)
			// const entry = new Article(result);

			// Now, save that entry to the db
			// entry.save((err, doc) => {
			// 	if (err){
			// 		throw err;
			// 	} else
			// 		console.lof(doc);
			// });
			docs.push(result);

		});
		res.json(docs);
	});

	// Tell the browser that we finished scraping the text
	// res.send("Scrape Complete");
});

// Listen on port 3000
app.listen(3000, ()=> {
	console.log("App running on port 3000!");
});