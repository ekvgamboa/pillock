const express = require('express')
const app = express()
const expresslayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')
const aboutRouter = require('./routes/about')
const loginRouter = require('./routes/login')
const signUpRouter = require('./routes/signup')
const loggedRouter = require("./routes/loggedin")

var loggedIn = false;

app.set('view engine','ejs')

app.set('views',__dirname + '/views')
app.set('layout','layouts/layout')
app.set('view cache',false)
app.use(expresslayouts)
app.use(express.static('public'))

const mongoose = require('mongoose')

app.use('/',indexRouter)
app.use('/about',aboutRouter)
app.use('/login',loginRouter)
app.use('/signup',signUpRouter)
app.listen(process.env.PORT || 3000)