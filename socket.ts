import axios, { AxiosResponse } from "axios";
import { Socket } from "socket.io"
import { FoundMovie, FullMovieInfo } from "./types/types";

const RoomInvite = require('./models/roomInvite')
const Poll = require('./models/poll')
const Movie = require('./models/movie')
const User = require('./models/user')

exports = module.exports = function(io: Socket){
    io.on('connection', (socket)=>{
        console.log("user connected");
        socket.on('disconnect', () => {
            console.log("disconnect")
            Poll.findOne({_id: socket.roomId}, (err: any, poll: any)=>{
                if(err){
                    console.log(err)
                }else{
                    if(poll){
                        if(poll.host.user.toString() == socket.userId.toString()){
                            poll.host.maxNumberOfVotes = socket.numberOfMoviesToAdd
                            poll.host.isConnected = false
                        }else{
                            const voters = poll.voters
                            for(let i = 0; i < voters.length; i++){
                                if(voters[i].voter._id.toString() === socket.userId.toString()){
                                    voters[i].maxNumberOfVotes = socket.numberOfMoviesToAdd
                                    voters[i].isConnected = false
                                    break
                                }
                            }
                        }
                        poll.save()
                    }
                }   
            })
        })

        socket.on('joinRoom', (roomId: String, userId: String)=>{
            socket.join(roomId)
            socket.roomId = roomId
            socket.userId = userId
            socket.numberOfMoviesToAdd = 0
            Poll.findOne({_id: socket.roomId}, (err: any, poll: any)=>{
                if(err){
                    console.log(err)
                }else{
                    if(poll && !poll.voting){
                        if(poll.host.user.toString() == socket.userId.toString()){
                            socket.numberOfMoviesToAdd = poll.host.maxNumberOfVotes - poll.host.numberOfVotes
                            poll.host.isConnected = true
                        }else{
                            const voters = poll.voters
                            for(let i = 0; i < voters.length; i++){
                                if(voters[i].voter._id.toString() === socket.userId.toString()){
                                    socket.numberOfMoviesToAdd = voters[i].maxNumberOfVotes - voters[i].numberOfVotes
                                    voters[i].isConnected = true
                                    break
                                }
                            }
                        }
                        poll.save()
                        socket.to(socket.roomId).emit('updateRoomInfo', poll.movies.length, poll.voters.length + 1)
                        socket.emit('updateRoomInfo', poll.movies.length, poll.voters.length + 1, socket.numberOfMoviesToAdd)
                    }else if(poll && poll.voting){
                        if(poll.host.user.toString() == socket.userId.toString()){
                            poll.host.isConnected = true
                            poll.host.isVoting = true
                            return
                        }
                        const voters = poll.voters
                        for(let i = 0; i < voters.length; i++){
                            if(voters[i].voter._id.toString() === socket.userId.toString()){
                                socket.numberOfMoviesToAdd = voters[i].maxNumberOfVotes - voters[i].numberOfVotes
                                voters[i].isConnected = true
                                voters[i].isVoting = true
                                return
                            }
                        }
                        poll.save()
                    }
                }   
            })
        })

        socket.on('fetchMovies', (movieName: string)=>{
            axios.get('http://www.omdbapi.com/?s='+movieName+'&type=movie&apikey='+process.env.MOVIE_API_KEY)
                .then((res: AxiosResponse)=>{
                    socket.emit('fetchMovies', JSON.stringify(res.data), movieName)
                })
        })

        socket.on('fetchMoreMovies', (movieName: string, page: string = "1")=>{
            axios.get('http://www.omdbapi.com/?s='+movieName+'&page='+page+'&type=movie&apikey='+process.env.MOVIE_API_KEY)
                .then((res: AxiosResponse)=>{
                    socket.emit('fetchMoreMovies', JSON.stringify(res.data), movieName, page)
                })
        })

        socket.on('fetchFullMovieDetails', (id: string, elementId: string, buttonId: string)=>{
            axios.get('http://www.omdbapi.com/?i='+id+'&type=movie&apikey='+process.env.MOVIE_API_KEY)
                .then((res: AxiosResponse)=>{
                    socket.emit('fetchFullMovieDetails', JSON.stringify(res.data), elementId, buttonId )
                })
        })

        socket.on('sendRoomInvite', async(friendId: string, roomId: string, hostId: string)=>{
            try{
                RoomInvite.findOne({room: roomId, to: friendId}, async (err:any, invite:any)=>{
                    if(err){
                        console.log(err)
                    }else{
                        if(!invite){
                            const invite = new RoomInvite({room: roomId, to: friendId, from: hostId})
                            await invite.save()
                            RoomInvite.find( {room: roomId, from: socket.userId})
                            .sort({'accepted': -1})
                            .populate('to')
                            .exec((err: any, invites: any)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    User.findOne({_id: socket.userId})
                                    .populate('friends')
                                    .exec((err: any, user: any)=>{
                                        if(err){
                                            console.log(err)
                                        }else{
                                            if(user){
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
                                                socket.emit('updateFriendList', invites, friendsToInvite)
                                            }
                                        }
                                    })
                                     
                                }
                            })
                        }
                    }
                })
            }catch(e){
                console.log(e)
            }
        })

        socket.on('addToQueue', async(imdbID: string)=>{
            try{
                if(socket.numberOfMoviesToAdd >= 1){
                    let movie = await Movie.findOne({imdbID})
                    if(!movie){
                        axios.get('http://www.omdbapi.com/?i='+imdbID+'&apikey='+process.env.MOVIE_API_KEY)
                        .then((res: AxiosResponse)=>{
                            delete res.data.Ratings
                            delete res.data.BoxOffice
                            delete res.data.Production
                            delete res.data.Website
                            delete res.data.Response
                            const newMovie = new Movie(res.data)
                            newMovie.save();
                            Poll.findOne({_id: socket.roomId}, (err: any, poll: any)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    poll.movies.push({movie: newMovie})
                                    poll.save()
                                    socket.numberOfMoviesToAdd--
                                    socket.to(socket.roomId).emit('updateRoomInfo', poll.movies.length, poll.voters.length + 1)
                                    socket.emit('updateRoomInfo', poll.movies.length, poll.voters.length + 1, socket.numberOfMoviesToAdd)
                                }   
                            })
                        })
                    }else{
                        const pollRoom = await Poll.findOne({_id: socket.roomId, 'movies.movie': {$nin: [movie._id]}})
                        if(pollRoom){
                            pollRoom.movies.push({ movie })
                            pollRoom.save()
                            socket.numberOfMoviesToAdd--
                            socket.to(socket.roomId).emit('updateRoomInfo', pollRoom.movies.length, pollRoom.voters.length + 1)
                            socket.emit('updateRoomInfo', pollRoom.movies.length, pollRoom.voters.length + 1, socket.numberOfMoviesToAdd)
                        }
                    }
                }
            }catch(e){
                console.log(e)
            }
        })
        // Ratings, DVD, BoxOffice, Production, Website, Response
        socket.on('checkIfMovieInDb', async(imbdId: string)=>{
            try{
                const movie = await Movie.findOne({imbdId})
                if(!movie){
                    axios.get('http://www.omdbapi.com/?i='+imbdId+'&apikey='+process.env.MOVIE_API_KEY)
                    .then((res: AxiosResponse)=>{
                        delete res.data.Ratings
                        delete res.data.BoxOffice
                        delete res.data.Production
                        delete res.data.Website
                        delete res.data.Response
                        const newMovie = new Movie(res.data)
                        newMovie.save();
                    })
                    socket.emit('checkIfMovieInDb', imbdId, 0)
                }else{
                    socket.emit('checkIfMovieInDb', imbdId, 1)
                }
            }catch(e){
                console.log(e)
            }
        })

        socket.on('startVoting', async()=>{
            try{
                const poll = await Poll.findOne({ _id: socket.roomId })
                    .populate('movies.movie')
                // on objects remain
                // Title, Realeased, Runtime, Plot, Poster, imdbId

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
                poll.voting = true

                // loop to change status of connectet nodes
                for(let i = 0; i < poll.voters.length; i++){
                    let node = poll.voters[i]
                    if(node.isConnected){
                        node.isVoting = true
                    }
                }

                //check if host is connected
                if(poll.host.isConnected){
                    poll.host.isVoting = true
                }

                await poll.save()
                socket.to(socket.roomId).emit('votingRoomMovies', moviesToSend)
                socket.emit('votingRoomMovies', moviesToSend)
            }catch(e){
                console.log(e)
            }
        })

        socket.on('sendVote', async(votes: any)=>{
            const poll = await Poll.findOne({ _id: socket.roomId})
                .populate('movies.movie')

            const voters = poll.voters
            const movies = poll.movies
            let winner = poll.movies[0]
            // add vote to overall score
            for(let i = 0; i < movies.length; i++){
                movies[i].votes += votes[movies[i].movie.imdbID]
            }

            // set flag for completed voting
            if(poll.host.user.toString() == socket.userId.toString()){
                poll.host.isDoneVoting = true
            }else{
                for(let i = 0; i < voters.length; i++){
                    if(voters[i].voter._id.toString() === socket.userId.toString()){
                        voters[i].isDoneVoting = true
                        break
                    }
                }
            }

            // check if everybody is done with woting
            let isVotingDone = true
            const host = poll.host
            if(!(host.isDoneVoting && host.isVoting)){
                isVotingDone = false
            }
            for(let i = 0; i < voters.length; i++){
                if(!(voters[i].isDoneVoting && voters[i].isVoting)){
                    isVotingDone = false
                }
            }

            if(!isVotingDone){
                socket.emit('waitingForResaults')
            }else{
                poll.finished = true
                for(let i = 1; i < movies.length; i++){
                    if(movies[i].votes > winner.votes){
                        winner = movies[i]
                    }
                }
                socket.to(socket.roomId).emit('sendWinnerInfo', winner.movie)
                socket.emit('sendWinnerInfo', winner.movie)
            }
            poll.winner.movie = winner.movie
            poll.winner.votes = winner.votes
            await poll.save()
        })
    })
}