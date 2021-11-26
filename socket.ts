import axios, { AxiosResponse } from "axios";
import { Socket } from "socket.io"

const RoomInvite = require('./models/roomInvite')

exports = module.exports = function(io: Socket){
    io.on('connection', (socket)=>{
        console.log("user connected");
    
        socket.on('disconnect', () => {
            console.log("disconnect")
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

        socket.on('sendRoomInvite', (friendId: string, roomId: string)=>{
            try{
                RoomInvite.findOne({room: roomId, to: friendId}, (err:any, invite:any)=>{
                    if(err){
                        console.log(err)
                    }
                    if(!invite){
                        const invite = new RoomInvite({room: roomId, to: friendId})
                        invite.save()
                    }
                })
            }catch(e){
                console.log(e)
            }
        })
    })
}