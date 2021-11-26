import { Request, Response, NextFunction } from "express";
const Poll = require('../models/poll')

async function validateEntry(req: Request, res: Response, next: NextFunction){
    let { entryCode } = req.body
    if(entryCode){
        let poll = await Poll.findOne({entryCode})
        if(poll){
            poll.voters.push(res.locals.currentUser)
            next()
        }else{
            res.redirect('/user/'+res.locals.currentUser._id)
        }
    }else{
        let poll = await Poll.findOne({
            _id: req.params.id, 
            $or: [
                {voters: {$in: [res.locals.currentUser._id]}},
                {host: res.locals.currentUser._id}
            ]    
        })
        if(poll){
            next()
        }else{
            res.redirect('/user/'+res.locals.currentUser._id)
        }
    }
}

export { validateEntry }