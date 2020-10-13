const express = require('express')
const router = express.Router()

router.get('/',async (req,res)=>{
    res.render('resetpw',{title: "Pillock - Change Password"})
})

module.exports = router