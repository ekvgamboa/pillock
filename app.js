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


const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

const indexRouter = require('./routes/index')
const aboutRouter = require('./routes/about')
const loginRouter = require('./routes/login')
const signUpRouter = require('./routes/signup')
const loggedRouter = require("./routes/loggedin")


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

/*const mysql = require('mysql')

app.use('/',indexRouter)
app.use('/about',aboutRouter)
app.use('/login',loginRouter)
app.use('/signup',signUpRouter)
*/
app.get('/',checkAuthenticatedHome,(req,res)=>{

    res.render('index.ejs')
})

app.get('/login',checkNotAuthenticated,(req,res)=>{
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

app.get('/signup',checkNotAuthenticated,(req,res)=>{
    res.render('signup.ejs')
})

app.post('/signup',checkNotAuthenticated,async(req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }
    catch{
        res.redirect('/signup')
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
        return res.render('userpage.ejs',{ name: req.user.first_name })
    }
    next()
}

function checkAuthenticatedAbout(req,res,next){
    if(req.isAuthenticated()){
        return res.render('userabout.ejs',{ name: req.user.first_name })
    }
    next()
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(process.env.PORT || 3000)