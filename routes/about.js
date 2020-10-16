const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const mysql = require('mysql')
const { route } = require('./loggedin')

router.get('/',checkAuthenticatedAbout,async (req,res)=>{
    res.render('about',{title: "Pillock - About Us"})
})

function checkAuthenticatedAbout(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/LoggedIn/about')
    }
    next()
}

module.exports = router