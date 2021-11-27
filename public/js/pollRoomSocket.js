socket.on('fetchMovies', (data, movieName)=>{
    let movies = JSON.parse(data)
    if(movies && movies.Search){
        resetMoviesRender()
        showNumberOfMovies(movies.totalResults, movieName)
        renderPagination(movies.totalResults, movieName)
        renderMovies(movies.Search)
        renderPagination(movies.totalResults, movieName)
    }else{
        resetMoviesRender()
        renderError('No movies found')
    }
})

socket.on('fetchMoreMovies', (data, movieName, page)=>{
    let movies = JSON.parse(data)
    if(movies && movies.Search){
        resetMoviesRender()
        showNumberOfMovies(movies.totalResults, movieName)
        renderPagination(movies.totalResults, movieName, page)
        renderMovies(movies.Search)
        renderPagination(movies.totalResults, movieName, page)
    }else{
        resetMoviesRender()
        renderError('No movies found')
    }
})

function inviteFriend(friendId, roomId, hostId){
    console.log(friendId, roomId, hostId)
    socket.emit('sendRoomInvite', friendId, roomId, hostId)
}