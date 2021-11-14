socket.on('fetchMovies', (data)=>{
    let movies = JSON.parse(data)
    if(movies && movies.Search)
        renderMovies(movies.Search)
    else    
        renderError('No movies found')
})