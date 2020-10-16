const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcrypt')

let users = []

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
        else
            console.log("Connected")
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
      //console.log(users);
    })
    
    con.end(function(err){
        if(err)
            throw err
        else
            console.log("database closed...")
    });
}catch{

}

router.get('/',checkAuthenticated, async (req,res)=>{
    res.render('userpage',{title: "Welcome to Pillock"})
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

module.exports = router