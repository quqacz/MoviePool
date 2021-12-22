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
            newPoll.host.user = res.locals.currentUser
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
        if(!poll.voting){
            if(res.locals.currentUser._id.toString() === poll.host.user._id.toString()){
                const user = await User.findOne({
                    _id: res.locals.currentUser._id
                }).populate('friends')
                const invites = await RoomInvite.find({ room: req.params.id })
                    .sort({ 'accepted': -1 })
                    .populate('to')

                const friendsToInvite = []
                const invitedFriends = []
                const friends = user.friends

                for(let i = 0; i < invites.length; i++){
                    invitedFriends.push(invites[i].to._id.toString())
                }

                for(let i = 0; i < friends.length; i++){
                    if(!invitedFriends.includes(friends[i]._id.toString())){
                        friendsToInvite.push(friends[i])
                    }
                }
                res.render('poll', {poll, invitedFriends: invites, friendsToInvite, moviesToVoteOn: []})
            }else{
                res.render('poll', {poll, invitedFriends: undefined, friendsToInvite: undefined, moviesToVoteOn: []})
            }
        }else if(poll.voting && !poll.finished){
            await poll.populate('movies.movie')
            let moviesToSend = []
            for(let i = 0; i < poll.movies.length; i++){
                moviesToSend.push({
                    Title: poll.movies[i].movie.Title,
                    Released: poll.movies[i].movie.Released,
                    Runtime: poll.movies[i].movie.Runtime,
                    Plot: poll.movies[i].movie.Plot,
                    Poster: poll.movies[i].movie.Poster,
                    imdbID: poll.movies[i].movie.imdbID
                })
            }
            res.render('poll', {poll, moviesToVoteOn: moviesToSend})
        }else if(poll.finished){
            await poll.populate('winner.movie')
            res.render('poll', {poll, moviesToVoteOn: []})
        }
    }catch(e){
        console.log(e)
        res.redirect('/')
    }
})

Polls.post('/join/code', isLoggedIn, validateCodeEntry, (req: Request, res: Response)=>{})

Polls.get('/:invId/accept/:to', isLoggedIn, async(req: Request, res: Response)=>{
    try{
        const { invId, to } = req.params
        const invite = await RoomInvite.findOne({_id: invId, to})
        const room = await Poll.findOne({_id: invite.room})
        if(room && !room.voters.includes({voter: to.toString()})){
            room.voters.push({voter: to});
            room.save()
        }
        invite.accepted = true;
        invite.save()
        res.redirect('/poll/'+room._id)
    }catch(e){
        console.log(e)
        res.redirect('/')
    }
})

export default Polls