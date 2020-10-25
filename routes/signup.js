const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const mysql = require('mysql')
const con = require('../app')

let users = []
try {

    let showinfo = `SELECT * FROM userinfo`;
    con.query(showinfo, function (error, results) {
        if (error) {
            return console.error(error.message);
        }

        Object.keys(results).forEach(function (key) {
            var row = results[key];
            users.push({
                id: row.uid_user,
                first_name: row.name,
                last_name: row.surname,
                email: row.email,
                web_pw: row.web_pw,
                dob: row.DOB
            })
        })
    })
} catch (err) {
    console.log(err)
}

router.get('/', async (req, res) => {

    res.render('signup', { title: "Pillock - Sign Up", message: "" })

})

router.post('/', checkNotAuthenticated, async (req, res) => {

    var f_n = req.body.first_name;
    var l_n = req.body.last_name;
    var em = req.body.email;
    var bd = req.body.birthday
    const pw = await bcrypt.hash(req.body.password, 10);
    users = []

    try {
        let getid = `SELECT * FROM userinfo WHERE email='${em}' `;
        con.query(getid, function (error, results) {

            if (error) {
                return console.error(error.message);
            }
            Object.keys(results).forEach(function (key) {
                var row = results[key];
                users.push({
                    id: row.uid_user,
                    first_name: f_n,
                    last_name: l_n,
                    email: em,
                    web_pw: pw,
                    dob: bd
                });
            });
            if (users.find(user => user.email === em)) {
                res.render('signup', { message: "User exists with entered email!" })
            } else if(req.body.password != req.body.cpassword){
                res.render('signup',{message: "Passwords do not match!"})
            }else {
                var db_in = `INSERT INTO userinfo (name, surname, DOB, email, web_pw) VALUES ('${f_n}', '${l_n}', '${bd}','${em}', '${pw}')`;
                con.query(db_in, function (err, result) {
                    if (err) throw err;
                    // console.log(result);
                })

                res.redirect('/login')
                // console.log(users);
            }
        });

    }
    catch {
        res.redirect('/signup')
    }

})

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/loggedIn/user')
    }
    next()
}

module.exports = router