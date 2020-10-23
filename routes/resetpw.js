const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const mysql = require('mysql')
const con = require('../app')
let users = []

try {
    con.query(`SELECT email FROM userinfo`, function (err, result) {
        if (err) throw err;

        Object.keys(result).forEach(function (key) {
            var row = result[key];
            users.push(row)
        })
    })
} catch (err){
    console.log(err)
}

router.get('/', async (req, res) => {
    res.render('resetpw', {
        title: "Pillock - Change Password",
        message: req.flash("noUser"),
        passwordm: req.flash('mismatch')
    })
})

router.put('/', async (req, res) => {
    var em = req.body.email
    var new_pw
    if (!users.find(user => user.email === em)) {
        req.flash('noUser', "Email is not registered...")
        res.redirect('/change-password')
    }

    if (req.body.pw1 != req.body.pw2) {
        req.flash('mismatch', "Passwords do not match")
        res.redirect('/change-password')
    } else {
        new_pw = await bcrypt.hash(req.body.pw1, 10)
    }
    try {

        var db_in = `UPDATE userinfo SET web_pw='${new_pw}' WHERE email='${em}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
            // console.log("1 record updated" + result);
        })
        res.redirect('/')
    }
    catch (err){
        // res.redirect('/signup')
        console.log(err)
    }
})

module.exports = router