
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
// mongoose.connect("mongodb://localhost/scrapersoccer");
mongoose.connect("mongodb://heroku_zhdhz0fh:a8n9kesht3qqbneetjd6fe07d8@ds119772.mlab.com:19772/heroku_zhdhz0fh")
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
			const entry = new Article(result);

			// Now, save that entry to the db
			entry.save((err, doc) => {
				if (err){
					throw err;
				} else
					console.log(doc);
			});
			docs.push(result);

		});
		res.json(docs);
	});

	// Tell the browser that we finished scraping the text
	// res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", (req, res) => {
	// Grab every doc in the Articles array
	Article.find({}, (error, doc) => {
		// Log any errors
		if (error) {
			console.log(error);
		} else {
			res.json(doc);
		}
	});
});

// Grab an article by it's ObjectId
app.get("/articles/:id", (req, res) => {
	// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
	Article.findOne({"_id": req.params.id})
	// ...and populate all of the notes associated with it
	.populate("comment")
	// now, execute our query
	.exec((error, doc) => {
		if (error) {
			console.log(error);
		} else {
			res.json(doc);
		}
	});
});

// Create a new comment or delete an existing comment
app.post("/articles/:id", (req, res) => {
	// Create a new note and pass the req.body to the entry
	const newComment = new Comment(req.body);

	// And save the new comment to the db
	newComment.save((error, doc) => {
		if (error) {
			console.log(error);
		} else {
			// Use the article id to find it's note
			Article.findOneAndUpdate({"_id": req.params.id}, {"comment": doc._id})
			// Execute the above query
			.exec((err, doc) => {
				if (err) {
					console.log(err);
				} else {
					res.send(doc);
				}
			});
		}
	});
});



// Listen on port 3000
app.listen(3000, ()=> {
	console.log("App running on port 3000!");
});