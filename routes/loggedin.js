const express = require('express')
const router = express.Router()
const mysql = require('mysql')

let prescripts = ['aspirin','hot sizzle', 'niners suck']

router.get('/',async (req,res)=>{
    res.render('userindex',{title: "Welcome to Pillock"})
})

router.get('/about',(req,res)=>{
    res.render('userabout',{title: "Pillock - About Us"})
})

router.get('/user/edit',checkAuthenticatedEdit,(req,res)=>{

    try{
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })
    
        var db_in=`SELECT * FROM userinfo`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
            for(var i in result){
                if(req.user.email == result[i].email){
                    newDob = result[i].DOB == null ? '1900-01-01' : result[i].DOB.toISOString().split('T')[0]
                    res.render('editpage.ejs',{
                        message: '',
                        prescript: prescripts,
                        fname : result[i].name,
                        lname: result[i].surname,
                        birthday: newDob,
                        email: result[i].email
                    })
                }
            }
        })
        con.end(function(err){
            if(err)
                throw err
        })    
    } catch{
        res.redirect('/')
    }
})

router.get('/user',checkAuthenticated, async(req,res)=>{

    try{
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })
    
        var db_in=`SELECT * FROM userinfo`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
            for(var i in result){
                if(req.user.email == result[i].email){
                    newDob = result[i].DOB == null ? '1900-01-01' : result[i].DOB.toISOString().split('T')[0]
                    res.render('userpage.ejs',{
                        prescript: prescripts,
                        fname : result[i].name,
                        lname: result[i].surname,
                        birthdate: newDob,
                        email: result[i].email
                    })
                }
            }
        })  
        con.end(function(err){
            if(err)
                throw err
        })   
    } catch{
        res.redirect('/')
    }
    
    
})

router.put('/user/edit',async (req,res)=>{
    var f_n = req.body.first_name
    var l_n = req.body.last_name
    var em = req.user.email
    var b_d= req.body.birthday

    try{
        
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })
    
        var db_in=`UPDATE userinfo SET DOB='${b_d}', name='${f_n}', surname='${l_n}' WHERE email='${em}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
        })

        //console.log(u)
        let getid = `SELECT * FROM userinfo`;
        con.query(getid, function(error, results) {
            if (error) {
                return console.error(error.message);
            }
            for(var i in results){
                if(req.user.email == results[i].email){
                    newDob = results[i].DOB == null ? '1900-01-01' : results[i].DOB.toISOString().split('T')[0]
                    res.render('editpage.ejs',{
                        message: 'Succesfully Saved Profile',
                        prescript: prescripts,
                        fname: results[i].name,
                        lname: results[i].surname,
                        email: results[i].email,
                        birthday: newDob,
                    })
                }
            }
        })
        
        con.end(function(err){
            if(err)
                throw err
        })
    }
    catch{
        res.render('editpage.ejs',{
        message: "Error Editing Profile...",
        prescript: prescripts,
        fname: req.user.first_name,
        lname: req.user.last_name,
        email: req.user.email,
        birthday: newDob
        })
    }
}) 

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkAuthenticatedHome(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/LoggedIn')
    }
    next()
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/LoggedIn/user')
    }
    next()
}

function checkAuthenticatedEdit(req,res,next){
    if(req.isAuthenticated()){
        //return res.render('editpage.ejs',{fname: req.user.first_name, lname: req.user.last_name, email: req.user.email})
        return next()
    }
    res.redirect('/login')
    //next()
}

module.exports = router