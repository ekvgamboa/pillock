const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const mysql = require('mysql')

let users = []
    
router.get('/', updateUsers,async (req,res)=>{
    res.render('login',{title: "Pillock - Log In"})
})

router.post('/',checkNotAuthenticated,passport.authenticate('local-login',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))//test

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/LoggedIn/user')
    }
    next()
}

function updateUsers(req,res,next){
    try{
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })
        con.connect(function(err){
            if(err)
            throw err
        })
        
        let showinfo = `SELECT * FROM userinfo`;
        con.query(showinfo, function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        
        Object.keys(results).forEach(function(key) {
            var row = results[key];
            users.push({id : row.uid_user,
                        first_name : row.name,
                        last_name : row.surname,
                        email : row.email,
                        web_pw : row.web_pw,
                        dob : row.DOB} );
            });
        })
        
        con.end(function(err){
            if(err)
                throw err
        });
    }catch{

    }

    const initializePassport = require('../passport-config')
    initializePassport(
        passport,
        email => users.find(user => user.email === email),
        id => users.find(user => user.id === id)
    )
    next()
}

module.exports = router