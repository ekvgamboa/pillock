const express = require('express')
const router = express.Router()

router.get('/',async (req,res)=>{
    res.render('about',{title: "Pillock - About Us"})
})

module.exports = router