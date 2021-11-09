import express, {Request, Response, NextFunction } from 'express'
import { use } from 'passport';
const User = require('../models/user')
const Users = express()

Users.get('/:id', async (req: Request, res: Response)=>{
    try{
        const user = await User.findOne({_id: req.params.id}).populate('friends').populate('polls');
        res.render('userProfile', {user, friend: undefined})
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

Users.post('/:id/find', async (req: Request, res: Response)=>{
    try{
        const { friendName } = req.body
        const user = await User.findOne({_id: req.params.id}).populate('friends').populate('polls');
        const friend = await User.findOne({nickname: friendName})
        res.render('userProfile', {user, friend})
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

Users.post('/:id/add/:friendId', async (req: Request, res: Response)=>{
    try{
        const user = await User.findOne({_id: req.params.id}).populate('friends').populate('polls');
        const friend = await User.findOne({_id: req.params.friendId})
        user.friends.push(friend);
        user.save();
        res.redirect('/user/'+user._id)
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

export default Users