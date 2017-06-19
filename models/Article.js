// Require mongoose
const mongoose = require('mongoose');
// Create Schema class
const Schema = mongoose.Schema;

// Create article schema
const ArticleSchema = new Schema ({
	//summary is a required string
	title: {
		type: String,
		required: true
	},
	// link is a required string
	link: {
		type: String,
		required: true
	},
	comment: [{
		type: Schema.Types.ObjectId,
		ref: "Comments"
	}]
});

// Create the Article model with the ArticleSchema
const Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;