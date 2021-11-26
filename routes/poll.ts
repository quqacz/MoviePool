import express, {Request, Response, NextFunction } from 'express'
import { isLoggedIn } from '../middleware/permitions'
const Polls = express()
var shortHash = require('short-hash');
const Poll = require('../models/poll')

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

Polls.get('/:id', isLoggedIn, async(req: Request, res: Response)=>{
    res.render('poll')
})
export default Polls