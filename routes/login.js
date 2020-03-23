const express = require('express')
const router = express.Router()

router.get('/',async (req,res)=>{
    res.render('login',{title: "Pillock - Log In"})
})

module.exports = router