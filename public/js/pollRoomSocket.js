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

socket.on('updateRoomInfo', (numberOfMovies, numberOfVoters, numberOfMoviesToAdd = undefined)=>{
    renderRoomStats(numberOfMovies, numberOfVoters, numberOfMoviesToAdd)
})

socket.on('updateFriendList', (invitedFriends, friendsToInvite)=>{
    renderInvites(friendsToInvite, invitedFriends)
})

socket.on('votingRoomMovies', (movies)=>{
    renderVotingQueue(movies)
    moviesData = movies
})

socket.on('waitingForResaults', ()=>{
    renderWaitingAnim()
})

socket.on('sendWinnerInfo', (movie)=>{
    renderWinnerInfo(movie)
    console.log(movie)
})