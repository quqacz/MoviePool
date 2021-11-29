import axios, { AxiosResponse } from "axios";
import { Socket } from "socket.io"
import { FoundMovie } from "./types/types";

const RoomInvite = require('./models/roomInvite')
const Poll = require('./models/poll')
const Movie = require('./models/movie')

exports = module.exports = function(io: Socket){
    io.on('connection', (socket)=>{
        console.log("user connected");
    
        socket.on('disconnect', () => {
            console.log("disconnect")
        })

        socket.on('joinRoom', (roomId: String)=>{
            socket.join(roomId)
            socket.roomId = roomId
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

        socket.on('sendRoomInvite', (friendId: string, roomId: string, hostId: string)=>{
            try{
                RoomInvite.findOne({room: roomId, to: friendId}, (err:any, invite:any)=>{
                    if(err){
                        console.log(err)
                    }
                    if(!invite){
                        const invite = new RoomInvite({room: roomId, to: friendId, from: hostId})
                        invite.save()
                    }
                })
            }catch(e){
                console.log(e)
            }
        })

        socket.on('addToQueue', (movie: FoundMovie)=>{
            console.log('weszło w request')
            try{
                Poll.findOne({_id: socket.roomId}, (err: any, room: any)=>{
                    if(err){
                        console.log(err)
                    }else{
                        if(room){
                            console.log('weszło w pokój')
                            Movie.findOne({imdbId: movie.imdbID}, (err: any, foundMovie: any)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    if(foundMovie){
                                        console.log('jest film i go dodaje')
                                        room.movies.push(foundMovie)
                                        room.save()
                                    }else{
                                        console.log('nie ma filmu, tworzy go')
                                        const newMovie = new Movie({
                                            imdbId: movie.imdbID,
                                            year: movie.Year,
                                            poster: movie.Poster
                                        }, (err: any, addedMovie: any)=>{
                                            if(err){
                                                console.log(err)
                                            }else{
                                                console.log('nie ma filmu, dodaje go')
                                                room.movies.push(addedMovie)
                                                room.save()
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }catch(e){
                console.log(e)
            }
        })
    })
}