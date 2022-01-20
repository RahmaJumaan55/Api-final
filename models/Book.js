const mongoose = require("mongoose")
const Joi = require("joi")

const bookSchema = new mongoose.Schema({
  title: String,
  description: String,
  poster: String,
  bookpdf: String,

  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  category: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
  ],
})

const bookAddJoi = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(5).max(1000).required(),
  poster: Joi.string().min(5).max(1000).required(),
  category: Joi.array().items().min(1).required(),
  bookpdf: Joi.string().uri().min(1).required(),
})
const bookEditJoi = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().min(5).max(1000),
  poster: Joi.string().min(5).max(1000),
  category: Joi.array().items().min(1),
  bookpdf: Joi.string().uri().min(1),
})

const Book = mongoose.model("Book", bookSchema)

module.exports.bookAddJoi = bookAddJoi
module.exports.bookEditJoi = bookEditJoi

module.exports.Book = Book
