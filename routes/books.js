const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkid = require("../middleware/checkid")
const checkToken = require("../middleware/checkToken")
const validatebody = require("../middleware/validatebody")
const { Book, bookAddJoi,bookEditJoi } = require("../models/Book")
// const { Room } = require("../models/Room")
const { User } = require("../models/User")
const { Comment, commentJoi } = require("../models/Comment")
const validateId = require("../middleware/validateId")
const router = express.Router()

//-------------------------------------------Get Book--------------------------------------------------------//
router.get("/", async (req, res) => {
  const books = await Book.find().populate({ path: "comments", populate: "owner" }).populate("category")
  // .populate("bookpdf")
  res.json(books)
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
//-------------------------------------------post Book--------------------------------------------------------//
router.post("/", checkAdmin, validatebody(bookAddJoi), async (req, res) => {
  try {
    const { title, description, poster, category,bookpdf } = req.body
    const book = new Book({
      title,
      description,
      poster,
      category,
      bookpdf,
    })
    await book.save()
    res.json(book)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
//-------------------------------------------edit Book--------------------------------------------------------//
router.put("/:id", checkAdmin, checkid, validatebody(bookEditJoi), async (req, res) => {
  try {
   const  { title, description, poster, category,bookpdf } = req.body
   const book = await Book.findByIdAndUpdate(req.params.id , {
        $set: {
          title,
          description,
          poster,
          category,
          bookpdf,
        },
      },
      { new: true }
    )
    if (!book) return res.status(404).send("book not found")
    res.json(book)
  } catch (error) {
    console.log(error)
    res.status(300).send(error.message)
  }
})
//-------------------------------------------Delete Book--------------------------------------------------------//
router.delete("/:id", checkid, async (req, res) => {
  try {
    const book = await Book.findByIdAndRemove(req.params.id)
    if (!book) return res.status(404).send("book not found")
    res.send("book is removed")
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})
//-------------------------------------------Comment------------------------------------------------------------//
router.get("/:bookId/comments", validateId("bookId"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId)
    if (!book) return res.status(404).send("book not found")

    const comments = await Comment.find({ bookId: req.params.bookId })
    res.json(comments)
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})
//-------------------------------------------post Comment----------------------------------------------------------//
router.post("/:bookId/comments", checkToken, validateId("bookId"), validatebody(commentJoi), async (req, res) => {
  try {
    const { comment } = req.body
    const book = await Book.findById(req.params.bookId)
    if (!book) return res.status(404).send("book not found")

    const newComment = new Comment({ comment, owner: req.userId, bookId: req.params.bookId })
    await Book.findByIdAndUpdate(req.params.bookId, { $push: { comments: newComment._id } })

    await newComment.save()
    res.json(newComment)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
//-------------------------------------------delete Comment------------------------------------------------------------//
router.delete("/:bookId/comments/:commentId", checkToken, validateId("bookId", "commentId"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId)
    if (!book) return res.status(404).send("book not found")

    const user = await User.findById(req.userId)

    const commentFound = await Comment.findById(req.params.commentId)

    if (user.role !== "Admin" && commentFound.owner != req.userId)
      return res.status(403).send("unauthoraiztion action ")
    await Book.findOneAndUpdate(req.params.bookId, { $pull: { comments: commentFound._id } })

    await Comment.findOneAndRemove(req.params.commentId)
    res.send("comment is removed")
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})
//-------------------------------------------Like---------------------------------------------------------------//
router.get("/:bookId/likes", checkToken, validateId("bookId"), async (req, res) => {
  try {
    let book = await Book.findById(req.params.bookId)
    if (!book) return res.status(404).send("book not found")

    const userFound = book.likes.find(like => like == req.userId)
    if (userFound) {
      await Book.findByIdAndUpdate(req.params.bookId, { $pull: { likes: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { likes: req.params.bookId } })

      res.send("removed like from book ")
    } else {
      await Book.findByIdAndUpdate(req.params.bookId, { $push: { likes: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $push: { likes: req.params.bookId } })
      res.send("like add")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})

module.exports = router
