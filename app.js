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
    email => users.find(user => user.email === email),//con.query(SELECT "email" from "userinfo")
    id => users.find(user => user.id === id)//con.query(SELECT "ID" form "userinfo")
)

const users = []
const prescripts = ['aspirin', 'hot sauce', 'seahawks are trash']

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


con.end(function(err){
    if(err)
        throw err
    else
        console.log("database closed...")
})
    


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

app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/about',checkAuthenticatedAbout,(req,res)=>{
    res.render('about.ejs')
})
app.get('/loggedIn/about',(req,res)=>{
    res.render('userabout.ejs',{ name: req.user.first_name })
})

app.get('/signup',checkNotAuthenticated,(req,res)=>{
    res.render('signup.ejs')
})

app.get('/loggedIn/edit',checkAuthenticatedEdit,(req,res)=>{
    res.render('editpage.ejs',{
        fname: req.user.first_name,
        lname: req.user.last_name,
        email: req.user.email,
        birthday: req.user.birthdate,
        prescript: prescripts})
})
app.get('/edit',(req,res)=>{
    res.redirect('/loggedIn/edit')
})
app.get('/loggedIn/user',checkAuthenticated,(req,res)=>{
    res.render('userpage.ejs',{
        prescript: prescripts,
        fname: req.user.first_name,
        lname: req.user.last_name,
        email: req.user.email,
        birthdate: req.user.birthdate})
})
app.get('/user',checkAuthenticated,(req,res)=>{
    res.redirect('/loggedIn/user')
})

app.post('/signup',checkNotAuthenticated,async(req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            birthdate: req.body.birthday,
            email: req.body.email,
            password: hashedPassword
        })
        //con.query(INSERT into "userinfo" WHERE NAME IS id)
        res.redirect('/login')
    }
    catch{
        res.redirect('/signup')
    }
})
app.put('/loggedIn/edit',(req,res)=>{
    try{
        req.user.first_name = req.body.first_name
        req.user.last_name = req.body.last_name
        req.user.email = req.body.user_email
        req.user.birthdate = req.body.birthday
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