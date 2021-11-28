import { Request, Response, NextFunction } from "express";
const Poll = require('../models/poll')

async function validateEntry(req: Request, res: Response, next: NextFunction){
    let poll = await Poll.findOne({
        _id: req.params.id, 
        $or: [
            {voters: {$in: [res.locals.currentUser._id]}},
            {host: res.locals.currentUser._id}
        ]    
    })
    if(poll){
        return next()
    }else{
       return res.redirect('/user/'+res.locals.currentUser._id)
    }
}

async function validateCodeEntry(req: Request, res: Response, next: NextFunction){
    try{
        let { entryCode } = req.body
        let poll = await Poll.findOne({entryCode})
        if(poll){
            console.log(poll._id)
            poll.voters.push(res.locals.currentUser)
            poll.save()
            return res.redirect('/poll/'+poll._id)
        }else{
            return res.redirect('/user/'+res.locals.currentUser._id)
        }
    }catch(e){
        console.log(e)
        return res.redirect('/user/'+res.locals.currentUser._id)
    }
}

export { validateEntry, validateCodeEntry }