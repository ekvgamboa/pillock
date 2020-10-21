const express = require('express')
const router = express.Router()
const mysql = require('mysql')

router.get('/', checkAuthenticated, async (req, res) => {
    res.render('userindex', { title: "Welcome to Pillock" })
})

router.get('/about', checkAuthenticated, (req, res) => {
    res.render('userabout', { title: "Pillock - About Us" })
})

router.get('/user/edit', checkAuthenticatedEdit, (req, res) => {

    try {
        let u = []
        let p = []
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        var db_in = `SELECT * FROM userinfo 
                    LEFT JOIN prescriptions
                    ON userinfo.uid_user = prescriptions.uid_user
                    WHERE userinfo.uid_user='${req.user.id}'`;

        con.query(db_in, function (err, result) {
            if (err) throw err;

            Object.keys(result).forEach(function (key) {
                var row = result[key]
                u.push({
                    prescripts: row.pname,
                    dosage: row.dosage,
                    schedule: row.time,
                    count: row.count
                })
            })
            for (var i in result) {
                if (result[i].pname == null)
                    p = '--empty--'
                else
                    p.push(u[i].prescripts)
            }

            newDob = result[0].DOB == null ? '1900-01-01' : result[0].DOB.toISOString().split('T')[0]
            res.render('editpage.ejs', {
                message: "",
                title: "Pillock - Edit Profile",
                prescript: p,
                fname: result[0].name,
                lname: result[0].surname,
                birthdate: newDob,
                device: result[0].device_number,
                email: result[0].email
            })
        })
        con.end(function (err) {
            if (err)
                throw err
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/user', checkAuthenticated, async (req, res) => {
    let u = []
    let p = []
    try {
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        var db_in = `SELECT * FROM userinfo 
                    LEFT JOIN prescriptions
                    ON userinfo.uid_user = prescriptions.uid_user
                    WHERE userinfo.uid_user='${req.user.id}'`;

        con.query(db_in, function (err, result) {
            if (err) throw err;

            Object.keys(result).forEach(function (key) {
                var row = result[key]
                u.push({
                    prescripts: row.pname,
                    dosage: row.dosage,
                    schedule: row.time,
                    count: row.count
                })
            })
            for (var i in result) {
                if (result[i].pname == null)
                    p = '--empty--'
                else
                    p.push(u[i].prescripts)
            }

            newDob = result[0].DOB == null ? '1900-01-01' : result[0].DOB.toISOString().split('T')[0]
            res.render('userpage.ejs', {
                title: "Pillock - Welcome, ",
                prescript: p,
                fname: result[0].name,
                lname: result[0].surname,
                birthdate: newDob,
                device: result[0].device_number,
                email: result[0].email
            })

        })
        con.end(function (err) {
            if (err)
                throw err
        })
    } catch {
        res.redirect('/')
    }


})

router.put('/user/edit', async (req, res) => {
    var f_n = req.body.first_name
    var l_n = req.body.last_name
    var em = req.user.email
    var b_d = req.body.birthday

    try {
        let u = []
        let p = []
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        var db_in = `UPDATE userinfo SET DOB='${b_d}', name='${f_n}', surname='${l_n}' WHERE email='${em}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
        })

        //console.log(u)
        let getid = `SELECT * FROM userinfo 
                    LEFT JOIN prescriptions
                    ON userinfo.uid_user = prescriptions.uid_user
                    WHERE userinfo.uid_user='${req.user.id}'`;

        con.query(getid, function (error, result) {
            if (error) {
                return console.error(error.message);
            }
            Object.keys(result).forEach(function (key) {
                var row = result[key]
                u.push({
                    prescripts: row.pname,
                    dosage: row.dosage,
                    schedule: row.time,
                    count: row.count
                })
            })
            for (var i in result) {
                if (result[i].pname == null)
                    p = '--empty--'
                else
                    p.push(u[i].prescripts)
            }

            newDob = result[0].DOB == null ? '1900-01-01' : result[0].DOB.toISOString().split('T')[0]
            res.render('editpage.ejs', {
                message: "Successfully Saved Profile!",
                title: "Pillock - Edit Profile ",
                prescript: p,
                fname: result[0].name,
                lname: result[0].surname,
                birthdate: newDob,
                device: result[0].device_number,
                email: result[0].email
            })
            //res.redirect('/LoggedIn/user')
        })

        con.end(function (err) {
            if (err)
                throw err
        })
    }
    catch {
        res.render('editpage.ejs', {
            message: "Error Editing Profile...",
            prescript: p,
            fname: req.user.first_name,
            lname: req.user.last_name,
            email: req.user.email,
            birthday: newDob
        })
    }
})

router.get('/user/prescript', checkAuthenticated, async (req, res) => {
    let s = []
    let p = []
    let d = []
    let pid = []
    try {
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        var db_in = `SELECT * FROM prescriptions
                    WHERE prescriptions.uid_user='${req.user.id}'`;

        con.query(db_in, function (err, result) {
            if (err) throw err;

            Object.keys(result).forEach(function (key) {
                var row = result[key]
                p.push(row.pname)
                d.push(row.dosage)
                s.push(row.time)
                pid.push(row.uid_prescription)
            })

            res.render('editprescript.ejs', {
                title: "Pillock - Edit Prescription(s)",
                message: "",
                prescript: p,
                schedule: s,
                dosage: d,
                pid: pid
            })
        })
        con.end(function (err) {
            if (err)
                throw err
        })
    } catch {
        res.redirect('/')
    }

})

router.put('/user/prescript', checkAuthenticated, async (req, res) => {
    var pillname = req.body.pname
    var pilldosage = req.body.dosage
    var schedule = req.body.schedule
    var p_id = req.body.pid
    try {
        let pname = []
        let count = []
        let dose = []
        let sched = []
        let pid = []
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        var db_in = `UPDATE prescriptions
                      SET pname='${pillname}', dosage='${pilldosage}', time='${schedule}'
                      WHERE uid_user='${req.user.id}' AND uid_prescription='${p_id}'`;

        con.query(db_in, function (err, result) {
            if (err) throw err;
        })

        var update_set = `SELECT * FROM prescriptions where uid_user = '${req.user.id}'`;
        con.query(update_set,function(err,result){
            if(err) throw err;
            if (result.length == 0) {
                pname.push("--empty--")
                count.push("none")
                dose.push("none")
                sched.push("none")
            } else {
                for (var i in result) {
                    // p.push(result[i].pname)
                    pname.push(result[i].pname)
                    count.push(result[i].count)
                    dose.push(result[i].dosage)
                    sched.push(result[i].time)
                    pid.push(result[i].uid_prescription)
                }
            }
            res.render('editprescript.ejs', {
                title: "Pillock - Edit Prescription(s)",
                message: "Mikaela is the coolest ever",
                prescript: pname,
                count: count,
                dosage: dose,
                schedule: sched,
                pid: pid
            })
        })
        con.end(function (err) {
            if (err)
                throw err
        })
    }
    catch {
        res.render('editpage.ejs', {
            title: "Pillock - Edit Prescription(s)",
            message: "Error Editing Prescriptions...",
            prescript: pname,
            count: count,
            dosage: dose,
            schedule: sched,
            pid: p_id
        })
    }
})


router.get('/add-device', checkAuthenticated, (req, res) => {
    res.render('addDevice', {
        title: 'Pillock - Add Device',
        message: '',
        status: 1
    })
})

router.put('/add-device', checkAuthenticated, async (req, res) => {

    try {
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        if (req.body.pin1 == req.body.pin2) {
            var device = req.body.addDevice
            var pin = req.body.pin1

            var q = `UPDATE userinfo SET device_number = '${device}', passcode = '${pin}' WHERE uid_user = '${req.user.id}'`;
            con.query(q, function (err, result) {
                if (err) throw err;
                res.render('addDevice', {
                    title: 'Pillock - Add Device',
                    message: "Successfully Added Device! ",
                    status: 0
                })
            })
        } else {
            res.render('addDevice', {
                title: 'Pillock - Add Device',
                status: 2,
                message: 'PINs do not match...'
            })
        }
        con.end(function (err) {
            if (err)
                throw err
            // else
            //     console.log("database closed...")
        });
    } catch {
        res.render('addDevice', {
            title: 'Pillock - Add Device',
            status: 3,
            message: 'Could not add device...'
        })
    }
})

router.get('/manage-device', checkAuthenticated, (req, res) => {
    let pname = []
    let pbin = []
    try {
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })
        var db_in = `SELECT * FROM userinfo
                    LEFT JOIN prescriptions
                    ON userinfo.uid_user = prescriptions.uid_user
                    WHERE userinfo.uid_user='${req.user.id}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;

            Object.keys(result).forEach(function (key) {
                var row = result[key]
                pname.push(row.pname)
                pbin.push(row.bin)
            })

            res.render('manageDevice', ({
                title: 'Pillock - Manage Device',
                deviceID: result[0].device_number,
                pbin: pbin,
                pname: pname
            }))
        })
        con.end(function (err) {
            if (err)
                throw err
            // else
            //     console.log("database closed...")
        });
    } catch {

    }

})

router.put('/manage-device', checkAuthenticated, async (req, res) => {

})

router.get('/user/view-prescriptions', checkAuthenticated, (req, res) => {
    let pname = []
    let count = []
    let dose = []
    let sched = []
    try {
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        var db_in = `SELECT * FROM prescriptions WHERE uid_user = '${req.user.id}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
            if (result.length == 0) {
                pname.push("--empty--")
                count.push("none")
                dose.push("none")
                sched.push("none")
            } else {
                for (var i in result) {
                    // p.push(result[i].pname)
                    pname.push(result[i].pname)
                    count.push(result[i].count)
                    dose.push(result[i].dosage)
                    sched.push(result[i].time)
                }
            }
            res.render('prescriptions', {
                title: "Pillock - View Prescription(s)",
                prescript: pname,
                count: count,
                dosage: dose,
                schedule: sched
            })
        })
        con.end(function (err) {
            if (err)
                throw err
            // else
            //     console.log("database closed...")
        });
    } catch {

    }

})

router.get('/user/add-prescription',checkAuthenticated,async(req,res)=>{
    res.render('addprescript',{
        title: "Pillock - Add Prescription",
        message: '',
        status: 1
    })
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

function updatePrescripts(req, res, next) {
    next()
}
module.exports = router