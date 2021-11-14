import axios, { AxiosResponse } from "axios";
import { Socket } from "socket.io"

exports = module.exports = function(io: Socket){
    io.on('connection', (socket)=>{
        console.log("user connected");
    
        socket.on('disconnect', () => {
            console.log("disconnect")
        })

        socket.on('fetchMovies', (movieName: string)=>{
            axios.get('http://www.omdbapi.com/?s='+movieName+'&apikey='+process.env.MOVIE_API_KEY)
                .then((res: AxiosResponse)=>{
                    socket.emit('fetchMovies', JSON.stringify(res.data))
                })
        })
    })
}