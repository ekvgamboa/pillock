const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')


function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async(email,password,done)=>{
        const user = getUserByEmail(email)
        if(user == null){
            return done(null,false,{ message: 'No user found' })
        }
        try{
            if(await bcrypt.compare(password,user.web_pw)){
                return done(null,user)
            }
            else{
                return done(null,false,{ message: 'Incorrect Password' })
            }
        }catch(e){
            return done(e)
        }
    }

    const userExists = async(email,password, done) =>{
        const user = getUserByEmail(email)
        console.log(user)
        if (user != NULL)
            return done(null, false, { message: 'User already exists' })
        try {
            
            const con = mysql.createConnection({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASS,
                database: process.env.DATABASE_NAME
            })

            //var f_n = req.body.first_name
            //var l_n = req.body.last_name
            //var em = req.body.email
            //const pw = await bcrypt.hash(req.body.password, 10)
            var f_n = first_name
            var l_n = last_name
            var em = email
            const pw = await bcrypt.hash(password,10)

            var db_in = `INSERT INTO userinfo (name, surname, email, web_pw) VALUES ('${f_n}', '${l_n}', '${em}', '${pw}')`
            con.query(db_in, function (err, result) {
                if (err)
                    throw err
                //console.log("1 record inserted" + result);
            })


            let getid = `SELECT uid_user FROM userinfo WHERE email='${em}' `
            con.query(getid, function (error, results) {
                if (error) {
                    return console.error(error.message)
                }
                Object.keys(results).forEach(function (key) {
                    var row = results[key]
                    users.push({ id: row.uid_user, first_name: f_n, last_name: l_n, email: em, web_pw: pw })
                })
                // console.log(users);
            })
            return done(null, user)
        } catch (e) {
            return done(e)
        }
    }


    passport.use('local-login',new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.use('local-signup',new LocalStrategy({ usernameFeild: 'email',passwordField: 'password'}, userExists))
    passport.serializeUser((user,done)=>done(null,user.id))
    passport.deserializeUser((id,done) =>{
        return done(null,getUserById(id))
    })
}
module.exports = initialize