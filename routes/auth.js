const express = require('express')
const { loginValidator, registerValidator } = require('../middleware/formsValidator')

const passport = require('passport')
const Auth = express()

const User = require('../models/user')

Auth.get('/login', (req, res)=>{
    res.render('login')
})

Auth.post('/login', loginValidator, passport.authenticate('local', {failureRedirect: '/login'}), (req, res)=>{
    res.redirect('/');
})

Auth.get('/register', (req, res)=>{
    res.render('register')
})

Auth.post('/register', registerValidator, async(req, res)=>{
    try{
        const { username, nickname, password } = req.body;
        const user = new User({username, nickname});
        const regUser = await User.register(user, password);
        req.login(regUser, err=>{
            if(err){
                console.log(err)
                res.redirect('/register')
            }else{
                res.redirect('/user/'+regUser._id);
            }
        });
    } catch(e){
        console.log(e);
        res.redirect('/register')
    }
})

Auth.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/');
})

module.exports = Auth 