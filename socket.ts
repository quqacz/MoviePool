import axios, { AxiosResponse } from "axios";
import { Socket } from "socket.io"
import { FoundMovie } from "./types/types";

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
                    if(poll){
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
                RoomInvite.findOne({room: roomId, to: friendId}, (err:any, invite:any)=>{
                    if(err){
                        console.log(err)
                    }
                    if(!invite){
                        const invite = new RoomInvite({room: roomId, to: friendId, from: hostId})
                        invite.save()
                    }

                    Poll.findOne({_id: roomId}, (err: any, poll: any)=>{
                        if(err){
                            console.log(err)
                        }else{
                            User.findOne({_id: socket.userId})
                            .populate('friends')
                            .exec((err: any, user: any)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    console.log(user.friends)
                                    const friends = []
                                    const friendsInTheRoom = []
                                    const voters = poll.voters
                                    const friendlist = user.friends
                        
                                    for(let i = 0; i < voters.length; i++){
                                        friendsInTheRoom.push(voters[i].voter.toString())
                                    }
                        
                                    for(let i = 0; i < friendlist.length; i++){
                                        if(!friendsInTheRoom.includes(friendlist[i]._id.toString())){
                                            friends.push(friendlist[i])
                                        }
                                    }

                                    socket.emit('updateFriendList', friends)
                                }
                            })
                        }
                    })  
                })
            }catch(e){
                console.log(e)
            }
        })

        socket.on('addToQueue', async(imdbID: FoundMovie)=>{
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
                                    poll.movies.push(newMovie)
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
                            pollRoom.movies.push(movie)
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
    })
}