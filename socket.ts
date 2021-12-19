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
                    if(poll && !poll.voting){
                        if(poll.host.user.toString() == socket.userId.toString()){
                            poll.host.maxNumberOfVotes = socket.numberOfMoviesToAdd
                        }else{
                            let node = poll.voters.find((element: any)=> {element.voter.toString() === socket.userId.toString()})
                            if(node)
                                node.numberOfVotes = socket.numberOfMoviesToAdd
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
                        }else{
                            const voters = poll.voters
                            for(let i = 0; i < voters.length; i++){
                                if(voters[i].voter._id.toString() === socket.userId.toString()){
                                    socket.numberOfMoviesToAdd = voters[i].maxNumberOfVotes - voters[i].numberOfVotes
                                }
                            }
                        }
                        socket.to(socket.roomId).emit('updateRoomInfo', poll.movies.length, poll.voters.length + 1)
                        socket.emit('updateRoomInfo', poll.movies.length, poll.voters.length + 1, socket.numberOfMoviesToAdd)
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
                        const pollRoom = await Poll.findOne({_id: socket.roomId, movies: {$nin: [movie._id]}})
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
                // Title, Realeased, Runtime, Plot, Poster

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

            for(let i = 0; i < poll.movies.length; i++){
                poll.movies[i].votes += votes[poll.movies[i].movie.imdbID]
            }

            await poll.save()
        })
    })
}