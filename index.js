const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()
const cors = require("cors")
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectid = JoiObjectId(Joi)

const books = require("./routes/books")
const rooms = require("./routes/rooms")
const users = require("./routes/users")
const categories = require("./routes/categories")

mongoose
  .connect(`mongodb://localhost:27017/Book`)
  .then(() => {
    console.log("Connect to mongdb")
  })
  .catch(error => {
    console.log("Error connecting to MNOGDB", error)
  })

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/auth", users)
app.use("/api/rooms", rooms)
app.use("/api/books", books)
app.use("/api/categories", categories)

app.listen(5000, () => {
  console.log("server is listening on port " + 5000)
})
