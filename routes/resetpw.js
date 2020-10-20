const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const mysql = require('mysql')

const initializePassport = require('../passport-config')

router.get('/',async (req,res)=>{
    res.render('resetpw',{title: "Pillock - Change Password"})
})

router.put('/', async(req,res)=>{
    let users = []
    if(req.body.pw1==req.body.pw2){
        var em= req.body.email
        var new_pw=await bcrypt.hash(req.body.pw2,10)
        try{    

        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })
    
        var db_in=`UPDATE userinfo SET web_pw='${new_pw}' WHERE email='${em}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
            // console.log("1 record updated" + result);
        })

        con.end(function(err){
            if(err)
                throw err
            // else
            //     console.log("database closed...")
        })
        
        res.redirect('/')
        }
        catch{
            res.redirect('/signup')
        }
    }
})

module.exports = router