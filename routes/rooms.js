const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkid = require("../middleware/checkid")
const checkToken = require("../middleware/checkToken")
const validatebody = require("../middleware/validatebody")
const { Book, bookAddJoi } = require("../models/Book")
const mongoose = require("mongoose")
const { Room, roomAddJoi } = require("../models/Room")
const { User } = require("../models/User")
const { Comment, commentJoi } = require("../models/Comment")
const validateId = require("../middleware/validateId")
const router = express.Router()

//-------------------------------------------Get --------------------------------------------------------//
router.get("/", async (req, res) => {
  const rooms = await Room.find().populate("books")
  res.json(rooms)
})
router.get("/:id", checkid, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).send("book not found")
    res.json(book)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
router.get("/:id/books", checkid, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).send("room not found")

    const books = await Room.findById(req.params.id).select("books").populate("books")
    res.json(books)
  } catch (error) {
    res.status(500).send(error.message)
  }
})


//-------------------------------------------Delete Room--------------------------------------------------------//
router.delete("/:id", checkAdmin, checkid, async (req, res) => {
  try {
    const room = await room.findByIdAndRemove(req.params.id)
    if (!room) return res.status(404).send("room not found")
    res.send("room is removed")
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})
//-------------------------------------------post Room--------------------------------------------------------//
router.post("/", checkToken, validatebody(roomAddJoi), async (req, res) => {
  try {
    const { roomname, books } = req.body
    const room = new Room({
      roomname,
      books,
      user: req.userId,
    })
    await User.findByIdAndUpdate(req.userId, { $push: { rooms: room._id } })
    await room.save()
    res.json(room)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//-------------------------------------------delete Comment------------------------------------------------------------//
// router.delete("/:bookId/comments/:commentId", checkToken, validateId("filmId", "commentId"), async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.bookId)
//     if (!book) return res.status(404).send("book not found")

//     const user = await User.findById(req.userId)

//     const commentFound = await Comment.findById(req.params.commentId)

//     if (user.role !== "Admin" && commentFound.owner != req.userId)
//       return res.status(403).send("unauthoraiztion action ")
//     await Book.findOneAndUpdate(req.params.bookId, { $pull: { comments: commentFound._id } })

//     await Comment.findOneAndRemove(req.params.commentId)
//     res.send("comment is removed")
//   } catch (error) {
//     console.log(error)
//     res.status(500).send(error)
//   }

module.exports = router
