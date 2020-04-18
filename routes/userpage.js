const express = require('express')
const router = express.Router()

router.get('/',async (req,res)=>{
    res.render('userpage',{title: "Welcome to Pillock"})
})

module.exports = router