const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const mysql = require('mysql')

let users = []
try{
    const con = mysql.createConnection({
        host: prcoess.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        database: process.env.DATABASE_NAME
    })
    con.connect(function(err){
        if(err)
           throw err
        // else
        //     console.log("Connected")
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
        // else
        //     console.log("database closed...")
    });
    
}catch{

}

router.get('/',async (req,res)=>{
    
    res.render('signup',{title: "Pillock - Sign Up", message: ""})
    
})

router.post('/',checkNotAuthenticated,async(req,res)=>{

    var f_n = req.body.first_name;
    var l_n = req.body.last_name;
    var em = req.body.email;
    var bd = req.body.birthday 
    const pw= await bcrypt.hash(req.body.password, 10);
    
    if(users.find(user => user.email === em)){
        res.render('signup',{message: "User exists with entered email!"})
    }else{
        try{    
            const con = mysql.createConnection({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASS,
                database: process.env.DATABASE_NAME
            })
            /*let ue = con.query(`SELECT uid_user FROM userinfo WHERE email = '${em}'`,function(err){
                if(err) throw err;
            })*/

            var db_in=`INSERT INTO userinfo (name, surname, DOB, email, web_pw) VALUES ('${f_n}', '${l_n}', '${bd}','${em}', '${pw}')`;
            con.query(db_in, function (err, result) {
                if (err) throw err;
                //console.log("1 record inserted" + result);
            })

            let getid = `SELECT uid_user FROM userinfo WHERE email='${em}' `;
            con.query(getid, function(error, results) {
            if (error) {
                return console.error(error.message);
            }
            Object.keys(results).forEach(function(key) {
                var row = results[key];
                users.push({id : row.uid_user,
                            first_name : f_n,
                            last_name : l_n,
                            email :em,
                            web_pw :pw,
                            dob: bd} );
                });
            // console.log(users);
            });
            con.end(function(err){
                if(err)
                    throw err
                // else
                //     console.log("database closed...")
            })
        
            res.redirect('/login')
            
        }
        catch{
            res.redirect('/signup')
        }
    }
})

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/loggedIn/user')
    }
    next()
}

module.exports = router