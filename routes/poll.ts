import express, {Request, Response, NextFunction } from 'express'
import { isLoggedIn } from '../middleware/permitions'
import { validateEntry, validateCodeEntry } from '../middleware/pollRooms';

const Polls = express()
var shortHash = require('short-hash');

const Poll = require('../models/poll')
const User = require('../models/user')
const RoomInvite = require('../models/roomInvite')

Polls.get('/', isLoggedIn, (req: Request, res: Response)=>{
    try{
        let hash = Date.now().toString()
        let entryCode = shortHash(hash)
        const newPoll = new Poll({ entryCode })
        if(res.locals.currentUser){
            newPoll.host = res.locals.currentUser
        }
        newPoll.save()
        res.redirect('/poll/'+newPoll._id)
    }catch(e){
        console.log(e)
        res.redirect('/')
    }
})

Polls.get('/:id', isLoggedIn, validateEntry, async(req: Request, res: Response)=>{
    try{
        const poll = await Poll.findOne({_id: req.params.id})
        let friends = [];
        if(res.locals.currentUser._id.toString() === poll.host._id.toString()){
            const user = await User.findOne({_id: res.locals.currentUser._id}).populate('friends')
            friends = user.friends
        }
        res.render('poll', {poll, friends})
    }catch(e){
        console.log(e)
        res.redirect('/')
    }
})

Polls.post('/join/code', isLoggedIn, validateCodeEntry, (req: Request, res: Response)=>{})

Polls.get('/:invId/accept/:to', async(req: Request, res: Response)=>{
    try{
        const { invId, to } = req.params
        const invite = await RoomInvite.findOne({_id: invId, to})
        const room = await Poll.findOne({_id: invite.room})
        room.voters.push(to);
        room.save()
        invite.accepted = true;
        invite.save()
        res.redirect('/poll/'+room._id)
    }catch(e){
        console.log(e)
        res.redirect('/')
    }
})

export default Polls