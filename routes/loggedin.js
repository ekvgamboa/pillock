const express = require('express')
const router = express.Router()

router.get('/',async (req,res)=>{
    res.render('loggedin',{title: "Welcome to Pillock"})
})

module.exports = router