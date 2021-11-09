import express, {Request, Response, NextFunction } from 'express'
const User = require('../models/user')
const Users = express()

Users.get('/:id', async (req: Request, res: Response)=>{
    const user = await User.find({_id: req.params.id}).populate('friends').populate('polls');
    console.log(user.friends.length, user.polls.length)
    res.render('userProfile', {user})
})

export default Users