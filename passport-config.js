const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')


function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async(email,password,done)=>{
        const user = getUserByEmail(email)
        if(user == null){
            return done(null,false,{ message: 'No user found...' })
        }
        try{
            if(await bcrypt.compare(password,user.web_pw)){
                return done(null,user)
            }
            else{
                return done(null,false,{ message: 'Incorrect Password!' })
            }
        }catch(e){
            return done(e)
        }
    }

    passport.use('local-login',new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.use('local-signup',new LocalStrategy({usernameField: 'email'},async(email,password,done)=>{
        const user = getUserByEmail(email)
        if(user != null){
            return done(null,false,{message: 'User with entered email already exists!'})
        }
    }))
    passport.serializeUser((user,done)=>done(null,user.id))
    passport.deserializeUser((id,done) =>{
        return done(null,getUserById(id))
    })
}
module.exports = initialize