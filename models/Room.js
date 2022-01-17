const mongoose = require("mongoose")
const Joi = require("joi")

const roomSchema = new mongoose.Schema({
  roomname: String,
  books: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Book",
    },
  ],
  user:
    {
    type: mongoose.Types.ObjectId,
    ref: "User",
    },
  
})

const roomAddJoi = Joi.object({
  roomname: Joi.string().min(2).max(1000).required(),
  books: Joi.array().items(Joi.objectid()).min(1).required(),
  // book:Joi.string().uri().min(1).required(),
})

const Room = mongoose.model("Room", roomSchema)
module.exports.roomAddJoi = roomAddJoi
module.exports.Room = Room
