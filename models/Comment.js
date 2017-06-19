// Require mongoose
const mongoose = require('mongoose');
// Create Schema class
const Schema = mongoose.Schema;

// Create comment schema
const CommentSchema = new Schema ({
	//summary is a required string
	title: {
		type: String,
		required: true
	},
	body: {
		type: String,
		required: true
	},
});

// Create the Comment model with the CommentSchema
const Comment = mongoose.model("Comment", CommentSchema);

// Export the model
module.exports = Comment;