import express, {Request, Response, NextFunction } from 'express'
import { isLoggedIn, isUser } from '../middleware/permitions'
const User = require('../models/user')
const FriendRequest = require('../models/friendRequest')
const Users = express()

Users.get('/:id', isLoggedIn, isUser, async (req: Request, res: Response)=>{
    try{
        const user = await User.findOne({_id: req.params.id}).populate('friends').populate('polls');
        res.render('userProfile', {user, friends: undefined})
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

Users.post('/:id/find', isLoggedIn, isUser, async (req: Request, res: Response)=>{
    try{
        const { friendName } = req.body
        const user = await User.findOne({_id: req.params.id}).populate('friends').populate('polls');
        const friends = await User.find({nickname: {"$regex": friendName, $nin: [user.nickname]}, _id: {$nin: user.friends}})
        res.render('userProfile', {user, friends})
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

Users.get('/:id/notification', isLoggedIn, isUser, async (req: Request, res: Response)=>{
    try{
        const nots = await FriendRequest.find({to: req.params.id, accepted: false}).populate('from').populate('to');
        res.render('userProfileNotification', {nots})
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

Users.post('/:id/add/:friendId', isLoggedIn, isUser, async (req: Request, res: Response)=>{
    try{
        const take1 = await FriendRequest.findOne({to: req.params.id, from: req.params.friendId})
        const take2 = await FriendRequest.findOne({to: req.params.friendId, from: req.params.id})
        if(!take1 && !take2){
            const user = await User.findOne({_id: req.params.id});
            const friend = await User.findOne({_id: req.params.friendId})
            const friendReq = new FriendRequest({from: user, to: friend})
            friendReq.save();
        }
        res.redirect('/user/'+req.params.id)
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

Users.get('/:id/accept/:friendId', isLoggedIn, isUser, async (req: Request, res: Response)=>{
    try{
        const request = await FriendRequest.findOne({to: req.params.id, from: req.params.friendId})
        if(request){
            const user = await User.findOne({_id: req.params.id});
            const friend = await User.findOne({_id: req.params.friendId})
            
            user.friends.push(friend)
            user.save()

            friend.friends.push(user)
            friend.save();

            request.accepted = true;
            request.save()
        } 
        res.redirect('/user/'+req.params.id+"/notification")
    }catch(e){
        console.log(e)
        res.redirect('/');
    }
})

export default Users