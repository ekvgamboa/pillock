if (process.env.NODE_ENV !== 'production') {
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

const prescripts = ['aspirin', 'hot sauce', 'niners suck']

const mysql = require('mysql')

app.set('view engine', 'ejs')

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

const aboutRouter = require('./routes/about')
const logIndexRouter = require('./routes/loggedin')
const signUpRouter = require('./routes/signup')
const resetPWRouter = require('./routes/resetpw')
//const userPageRouter = require('.routes/userpage')
const loginRouter = require('./routes/login')

//app.use('/',indexRouter)
app.use('/about', aboutRouter)
app.use('/LoggedIn', logIndexRouter)
app.use('/login', loginRouter)
app.use('/signup', signUpRouter)
app.use('/Change-Password', resetPWRouter)


app.get('/', checkAuthenticatedHome, (req, res) => {
    //localhost:3000/
    res.render('index.ejs')
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkAuthenticatedHome(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/LoggedIn')
    }
    next()
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/LoggedIn/user')
    }
    next()
}

function checkAuthenticatedEdit(req, res, next) {
    if (req.isAuthenticated()) {
        //return res.render('editpage.ejs',{fname: req.user.first_name, lname: req.user.last_name, email: req.user.email})
        return next()
    }
    res.redirect('/login')
    //next()
}

app.listen(process.env.PORT || 3000)