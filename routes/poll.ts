import express, {Request, Response, NextFunction } from 'express'
import { isLoggedIn } from '../middleware/permitions'
import { validateEntry } from '../middleware/pollRooms';
const Polls = express()
var shortHash = require('short-hash');
const Poll = require('../models/poll')
const User = require('../models/user')

Polls.get('/', isLoggedIn, (req: Request, res: Response)=>{
    let hash = Date.now().toString()
    let entryCode = shortHash(hash)
    const newPoll = new Poll({ entryCode })
    if(res.locals.currentUser){
        newPoll.host = res.locals.currentUser
    }
    newPoll.save()
    res.redirect('/poll/'+newPoll._id)
})

Polls.get('/:id', isLoggedIn, validateEntry, async(req: Request, res: Response)=>{
    const poll = await Poll.findOne({_id: req.params.id})
    const user = await User.findOne({_id: res.locals.currentUser._id}).populate('friends')
    res.render('poll', {poll, friends: user.friends})
})
export default Polls