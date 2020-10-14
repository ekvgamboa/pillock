if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const expresslayouts = require('express-ejs-layouts')

//test
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

const prescripts = ['aspirin', 'hot sauce', 'niners suck']


/*const indexRouter = require('./routes/index')
const aboutRouter = require('./routes/about')
const loginRouter = require('./routes/login')
const signUpRouter = require('./routes/signup')
const loggedRouter = require("./routes/loggedin")
*/
const mysql = require('mysql')

/*const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password'
})
*/
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
    users.push({id : row.uid_user,first_name : row.name,last_name : row.surname, email : row.email, web_pw : row.web_pw, dob : row.DOB} );
    });
  //console.log(users);
})

con.end(function(err){
    if(err)
        throw err
    else
        console.log("database closed...")
});

app.set('view engine','ejs')

/*app.set('views',__dirname + '/views')
//app.set('layout','layouts/layout')
//app.set('view cache',false)
//app.use(expresslayouts)*/
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



/*
app.use('/',indexRouter)
app.use('/about',aboutRouter)
app.use('/login',loginRouter)
app.use('/signup',signUpRouter)
*/
app.get('/',checkAuthenticatedHome,(req,res)=>{
//localhost:3000/
    res.render('index.ejs')
})

app.get('/loggedIn',(req,res)=>{
    res.render('userindex.ejs')
})

app.get('/login',checkNotAuthenticated,(req,res)=>{
    //localhost:3000/login
    res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated,passport.authenticate('local-login',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))//test

app.get('/about',checkAuthenticatedAbout,(req,res)=>{
    res.render('about.ejs')
})
app.get('/loggedIn/about',(req,res)=>{
    res.render('userabout.ejs',{ name: req.user.first_name })
})

app.get('/signup',checkNotAuthenticated,(req,res)=>{
    res.render('signup.ejs',{message: ''})
})

app.get('/loggedIn/edit',checkAuthenticatedEdit,(req,res)=>{
    if(req.user.dob != null){
        var month =req.user.dob.getUTCMonth()+1
        var day =req.user.dob.getUTCDate()
        var year =req.user.dob.getUTCFullYear()
        newDob= year + "-" + month + "-" + day
    }
    else{
        newDob = "1900-01-01"
    }
    res.render('editpage.ejs',{
        fname: req.user.first_name,
        lname: req.user.last_name,
        email: req.user.email,
        birthday: newDob,
        prescript: prescripts})

})
app.get('/edit',(req,res)=>{
    res.redirect('/loggedIn/edit')
})
app.get('/loggedIn/user',checkAuthenticated,(req,res)=>{
    if(req.user.dob != null){
        var month =req.user.dob.getUTCMonth()+1
        var day =req.user.dob.getUTCDate()
        var year =req.user.dob.getUTCFullYear()
        newDob= year + "-" + month + "-" + day
    }
    else{
        newDob = "1900-01-01"
    }
    res.render('userpage.ejs',{
        prescript: prescripts,
        fname: req.user.first_name,
        lname: req.user.last_name,
        email: req.user.email,
        birthdate: newDob})
})

app.get('/resetpw', (req,res)=>{
    res.render('resetpw.ejs')
})

app.get('/user',checkAuthenticated,(req,res)=>{
    res.redirect('/loggedIn/user')
})
app.post('/resetpw', async(req,res)=>{
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
            console.log("1 record updated" + result);
        })
    
    
        let getid = `SELECT * FROM userinfo`;
        con.query(getid, function(error, results) {
          if (error) {
            return console.error(error.message);
          }
          Object.keys(results).forEach(function(key) {
            var row = results[key];
            users.push({id : row.uid_user,first_name : row.name,last_name : row.surname, email :row.email, web_pw :row.web_pw, dob: row.DOB} );
            });
            console.log(users);
        });
        con.end(function(err){
            if(err)
                throw err
            else
                console.log("database closed...")
        })
        res.redirect('/login')
        }
        catch{
            res.redirect('/signup')
        }
        

    }

})

/*app.post('/signup',passport.authenticate('local-signup',{
    successRedirect: '/login',
    failureRedirect: '/signup',
    failureFlash: true
}))//test
*/


app.post('/signup',checkNotAuthenticated,async(req,res)=>{
    let errors = []
    var f_n = req.body.first_name;
    var l_n = req.body.last_name;
    var em = req.body.email;
    var bd = req.body.birthday 
    const pw= await bcrypt.hash(req.body.password, 10);
    
    if(users.some(user => user.email === em)){
        res.render('signup.ejs',{message: "User with entered email already exists!"})
    }
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
            users.push({id : row.uid_user,first_name : f_n,last_name : l_n, email :em, web_pw :pw} );
            });
        // console.log(users);
        });
        con.end(function(err){
            if(err)
                throw err
            else
                console.log("database closed...")})
    
        res.redirect('/login')
        
    }
    catch{
        res.redirect('/signup')
    }
})

app.put('/loggedIn/edit',(req,res)=>{
    try{
        var f_n = req.body.first_name
        var l_n = req.body.last_name
        var em = req.body.user_email
        var b_d= req.body.birthday
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })
    
        var db_in=`UPDATE userinfo SET DOB='${b_d}', name='${f_n}', surname='${l_n}' WHERE email='${req.user.email}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
            console.log("1 record updated" + result);
        })
    


        res.redirect('/loggedIn/user')
    }
    catch{
        res.redirect('/loggedIn/edit')
    }
})   

app.delete('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/')
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkAuthenticatedHome(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/loggedIn')
    }
    next()
}

function checkAuthenticatedAbout(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/loggedIn/about')
    }
    next()
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/loggedIn/user')
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

app.listen(process.env.PORT || 3000)