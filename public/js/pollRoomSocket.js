socket.on('fetchMovies', (data)=>{
    let movies = JSON.parse(data)
    renderMovies(movies.Search);
})