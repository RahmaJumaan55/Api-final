const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkid = require("../middleware/checkid")
const validatebody = require("../middleware/validatebody")
const router = express.Router()
const { Category, categoryJoi,categoryEditJoi } = require("../models/Category")

router.get("/", async (req, res) => {
  const Categories = await Category.find()
  res.json(Categories)
})
router.post("/", checkAdmin, validatebody(categoryJoi), async (req, res) => {
  try {
    const { name } = req.body
    const category = new Category({
      name,
    })
    await category.save()
    res.json(category)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.put("/:id", checkAdmin, checkid, validatebody(categoryEditJoi), async (req, res) => {
  try {
   const  { name} = req.body
   const category = await Category.findByIdAndUpdate(req.params.id , {
        $set: {
          name,
          
        },
      },
      { new: true }
    )
    if (!category) return res.status(404).send("category not found")
    res.json(category)
  } catch (error) {
    console.log(error)
    res.status(300).send(error.message)
  }
})
router.delete("/:id", checkAdmin, checkid, async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id)
    if (!category) return res.status(404).send("category not found")
    res.send("category is removed")
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})
module.exports = router
