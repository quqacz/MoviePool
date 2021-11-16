const axios = require("axios");

exports = module.exports = function(io){
    io.on('connection', (socket)=>{
        console.log("user connected");
    
        socket.on('disconnect', () => {
            console.log("disconnect")
        })

        socket.on('fetchMovies', (movieName)=>{
            axios.get('http://www.omdbapi.com/?s='+movieName+'&apikey='+process.env.MOVIE_API_KEY)
                .then((res)=>{
                    socket.emit('fetchMovies', JSON.stringify(res.data), movieName)
                })
        })

        socket.on('fetchMoreMovies', (movieName, page = "1")=>{
            axios.get('http://www.omdbapi.com/?s='+movieName+'&page='+page+'&apikey='+process.env.MOVIE_API_KEY)
                .then((res)=>{
                    socket.emit('fetchMoreMovies', JSON.stringify(res.data), movieName, page)
                })
        })
    })
}