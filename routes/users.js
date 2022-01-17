const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const express = require("express")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const checkToken = require("../middleware/checktoken")
const checkAdmin = require("../middleware/checkAdmin")
const validateBody = require("../middleware/validateBody")
const router = express.Router()
const { User, singupJoi, loginJoi, profileJoi } = require("../models/User")

router.post("/singup", validateBody(singupJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar } = req.body

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).json("user alredy registered")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      // emailVerified: false,
      role: "User",
    })
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.SENDER_EMAIL,
    //     pass: process.env.SENDER_PASSWORD,
    //   },
    // })

    // const token = jwt.sign({ id: user._id }, process.env.jWT_SECRET_KEY, { expiresIn: "15d" })

    // await transporter.sendMail({
    //   from: `"testt testt" ${process.env.SENDER_EMAIL}`, //sender address
    //   to: email, // list of receivers
    //   subject: "Email verification", //Subject line

    //   html: `Hello, please click on this link to verify your email.
    //   <a href="http://localhost:3000/email_verified/${token}">Verify email</a>`, //html body
    // })

    await user.save()
    res.send("user created ")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// router.get("/email_verified/:token", async (req, res) => {
//   try {
//     const decryptedToken = jwt.verify(req.params.token, process.env.jWT_SECRET_KEY)
//     const userId = decryptedToken.id

//     const user = await User.findByIdAndUpdate(userId, { $set: { emailVerified: true } })
//     if (!user) return res.status(404).send("user not found")
//     res.send("user verified")
//   } catch (error) {
//     res.status(500).send(error.message)
//   }
// })
////////////////////////////////////////Add Admin/////////////////////////////////////////////////
router.post("/add-admin", checkAdmin, validateBody(singupJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar } = req.body
    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("user already registered")
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      role: "Admin",
    })
    await user.save()
    delete user._doc.password
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/login", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).send("user not found")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).send("password incorrect")

    // if (!user.emailVerified) return res.status(403).send("user not verifed, please check your email")
    const token = jwt.sign({ id: user._id }, process.env.jWT_SECRET_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})
router.post("/login/admin", async (req, res) => {
  try {
    const { email, password } = req.body
    const result = loginJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const user = await User.findOne({ email })
    if (!user) return res.status(400).send("user not found")
    if (user.role != "Admin") return res.status(400).send("You are not admin")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).send("password incorrect")

    const token = jwt.sign({ id: user._id }, process.env.jWT_SECRET_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.get("/profile", checkToken, async (req, res) => {
  const user = await User.findById(req.userId).select("-__v -password").populate("likes").populate({
    path: "rooms",
    populate:"books"
  })
  res.json(user)
})

router.put("/profile", checkToken, async (req, res) => {
  try {
    const { firstName, lastName, password, avatar } = req.body
    const result = profileJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)
    let hash
    if (password) {
      const salt = await bcrypt.genSalt(10)
      hash = await bcrypt.hash(password, salt)
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { firstName, lastName, password: hash, avatar } },
      { new: true }
    ).select("-__v -password")
    res.json(user)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

module.exports = router
