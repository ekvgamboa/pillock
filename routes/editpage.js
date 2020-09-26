const express = require('express')
const router = express.Router()

router.get('/',async (req,res)=>{
    res.render('editpage',{title: "Pillock - Edit Profile"})
})

module.exports = router