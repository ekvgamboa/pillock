const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const con = require('../app')

router.get('/', checkAuthenticated, async (req, res) => {
    res.render('userindex', { title: "Welcome to Pillock" })
})

router.get('/about', checkAuthenticated, (req, res) => {
    res.render('userabout', { title: "Pillock - About Us" })
})

router.get('/user', checkAuthenticated, async (req, res) => {
    let u = []
    let p = []
    let b = []
    try {

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
                    count: row.count,
                    bin: row.bin
                })
            })

            for (var i in result) {
                if (result[i].pname == null)
                    p = '--empty--'
                else
                    p.push(u[i].prescripts)
                b.push(u[i].bin)
            }

            newDob = result[0].DOB == null ? '1900-01-01' : result[0].DOB.toISOString().split('T')[0]
            res.render('userpage.ejs', {
                title: "Pillock - Welcome, ",
                prescript: p,
                fname: result[0].name,
                lname: result[0].surname,
                birthdate: newDob,
                device: result[0].device_number,
                email: result[0].email,
                pbin: b
            })
        })
    } catch {
        res.redirect('/')
    }
})

router.delete('/user', async (req, res) => {
    try {
        var del_user = `DELETE FROM userinfo WHERE uid_user = '${req.user.id}'`;
        con.query(del_user, function (err) {
            if (err) throw err;
            // console.log("YOU JUST DROPPED THAT DUNDUNDUN!")

            req.logout()
            res.redirect('/')
        })



    } catch {
        res.redirect('/LoggedIn/user')
    }
})

router.get('/user/edit', checkAuthenticatedEdit, (req, res) => {

    try {
        let u = []
        let p = []

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
                edituser: req.flash('edituser'),
                erruser: req.flash('erruser'),
                title: "Pillock - Edit Profile",
                prescript: p,
                fname: result[0].name,
                lname: result[0].surname,
                birthdate: newDob,
                device: result[0].device_number,
                email: result[0].email
            })
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

            req.flash('edituser', 'Successfully saved profile!')
            res.redirect("/LoggedIn/user/edit")
        })
    }
    catch {
        req.flash('erruser', 'Error saving profile...')
        res.redirect('/LoggedIn/user/edit')
    }
})

router.get('/user/prescript', checkAuthenticated, async (req, res) => {
    let s = []
    let p = []
    let d = []
    let pid = []
    try {
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
                editprescript: req.flash('editprescript'),
                errprescript: req.flash('errprescript'),
                prescript: p,
                schedule: s,
                dosage: d,
                pid: pid
            })
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

        var db_in = `UPDATE prescriptions
                      SET pname='${pillname}', dosage='${pilldosage}', time='${schedule}'
                      WHERE uid_user='${req.user.id}' AND uid_prescription='${p_id}'`;

        con.query(db_in, function (err, result) {
            if (err) throw err;
        })

        var update_set = `SELECT * FROM prescriptions where uid_user = '${req.user.id}'`;
        con.query(update_set, function (err, result) {
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
                    pid.push(result[i].uid_prescription)
                }
            }

            req.flash('editprescript', 'Successfully Saved Prescription(s)!')
            res.redirect('/LoggedIn/user/prescript')
        })
    }
    catch {
        req.flash('errprescript', 'Error saving prescription(s)...')
        res.redirect('/LoggedIn/user/prescript')
    }
})

router.get('/add-device', checkAuthenticated, (req, res) => {
    res.render('addDevice', {
        title: 'Pillock - Add Device',
        addSuccess: req.flash('addSuccess'),
        addError: req.flash('addError'),
        errPin: req.flash('errPin')
    })
})

router.put('/add-device', checkAuthenticated, async (req, res) => {

    try {

        if (req.body.pin1 == req.body.pin2) {
            var device = req.body.addDevice
            var pin = req.body.pin1

            var q = `UPDATE userinfo SET device_number = '${device}', passcode = '${pin}' WHERE uid_user = '${req.user.id}'`;
            con.query(q, function (err, result) {
                if (err) throw err;

                req.flash('addSuccess', 'Successfully added device!')
                res.redirect('/add-device')
            })
        } else {
            req.flash('errPin', 'PINs do not match...')
            res.redirect('/add-device')
        }
    } catch {
        req.flash('addError', 'Could not add device...')
        res.redirect('/add-device')
    }
})

router.get('/manage-device', checkAuthenticated, (req, res) => {
    try {
        let pname = []
        let pbin = []
        let pid = []
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        })

        con.connect(function (err) {
            if (err) throw err;
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
                pid.push(row.uid_prescription)
            })

            res.render('manageDevice', ({
                title: 'Pillock - Manage Device',
                editdev: req.flash('editdev'),
                errdev: req.flash('errdev'),
                deviceID: result[0].device_number,
                pbin: pbin,
                pname: pname,
                pid: pid
            }))
        })
    } catch {
        res.redirect('/')
    }

})

router.put('/manage-device', checkAuthenticated, async (req, res) => {

    try {

        let b = req.body.pbin
        let p = req.body.pid

        for (var i in p) {
            var db_in = `UPDATE prescriptions SET bin = '${b[i]}' WHERE uid_prescription='${p[i]}'`;
            con.query(db_in, function (err, result) {
                if (err) throw err;
            })
        }

        var sel_in = `SELECT * FROM userinfo
                    LEFT JOIN prescriptions
                    ON userinfo.uid_user = prescriptions.uid_user
                    WHERE userinfo.uid_user='${req.user.id}'`;

        con.query(sel_in, function (err, result) {
            if (err) throw err;

            req.flash('editdev', 'Successfully saved device!')
            res.redirect('/LoggedIn/manage-device')
        })
    } catch {
        req.flash('errdev', 'Error saving device...')
        res.redirect('/LoggedIn/manage-device')
    }
})

router.get('/user/view-prescriptions', checkAuthenticated, (req, res) => {
    let pname = []
    let count = []
    let dose = []
    let sched = []
    let pid = []
    try {

        var db_in = `SELECT * FROM prescriptions WHERE uid_user = '${req.user.id}'`;
        con.query(db_in, function (err, result) {
            if (err) throw err;
            if (result.length == 0) {
                pname.push("--empty--")
                count.push("none")
                dose.push("none")
                sched.push("none")
                pid.push('')
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

            res.render('prescriptions', {
                title: "Pillock - View Prescription(s)",
                success: req.flash('success'),
                prescript: pname,
                count: count,
                dosage: dose,
                schedule: sched,
                pid: pid
            })
        })
    } catch {

    }

})

router.delete('/user/view-prescriptions', checkAuthenticated, async (req, res) => {
    let pid = req.body.pid
    try {

        var del_pre = `DELETE FROM prescriptions WHERE uid_prescription = '${pid}'`;
        // con.query(del_pre, function (err) {
        //     if (err) return console.log(err);
        //     req.flash('success', "Successfully deleted prescription!")
        //     res.redirect('/LoggedIn/user/view-prescriptions')
        // })
        req.flash('success', "Successfully deleted prescription!")
            res.redirect('/LoggedIn/user/view-prescriptions')


    } catch {
        req.flash('success', "Error deleting prescription...")
        res.redirect('/LoggedIn/user/view-prescriptions')
    }
    // res.redirect('/LoggedIn/user/view-prescriptions')
})

router.get('/user/add-prescription', checkAuthenticated, async (req, res) => {
    res.render('addprescript', {
        title: "Pillock - Add Prescription",
        success: req.flash('success'),
        error: req.flash('error'),
    })
})

router.post('/user/add-prescription', checkAuthenticated, async (req, res) => {
    try {

        var add_prescript = `INSERT INTO prescriptions
                             (pname, dosage, time, uid_user)
                             VALUES ('${req.body.addPrescript}', '${req.body.dosage}','${req.body.schedule}', '${req.user.id}')`;

        con.query(add_prescript, function (err) {
            if (err) {
                throw err;
            }
        })

        let getid = `SELECT * FROM prescriptions WHERE uid_user = '${req.user.id}'`;
        con.query(getid, function (err, result) {
            if (err) throw err;

            req.flash('success', "Successfully added prescription!")
            res.redirect('/LoggedIn/user/add-prescription')
        })
    } catch {
        req.flash('error', 'Error adding prescription...')
        res.redirect('/LoggedIn/user/add-prescription')
    }
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

module.exports = router