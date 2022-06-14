import express, {Request, Response, NextFunction } from 'express'
import { loginValidator, registerValidator } from '../middleware/formsValidator'

const passport = require('passport')
const Auth = express.Router()

const User = require('../models/user')

Auth.get('/login', (req: Request, res: Response)=>{
    res.render('login')
})

Auth.post('/login', loginValidator, passport.authenticate('local', {failureRedirect: '/login'}), (req: Request, res: Response)=>{
    res.redirect('/');
})

Auth.get('/register', (req: Request, res: Response)=>{
    res.render('register')
})

Auth.post('/register', registerValidator, async(req: Request, res: Response)=>{
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

Auth.get('/logout', (req: Request, res: Response)=>{
    req.logOut();
    res.redirect('/');
})

export default Auth 