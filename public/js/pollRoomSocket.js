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
})

socket.on('fetchFullMovieDetails', (data, infoId, buttonId)=>{
    let movie = JSON.parse(data)
    let button = document.querySelector(`#${buttonId}`)
    let infoField = document.querySelector(`#${infoId}`)
    infoField.innerHTML = ''
    if(button.attributes.clicked.nodeValue === 'false'){
        button.classList.remove('bi-arrow-bar-down')
        button.classList.add('bi-arrow-bar-up')
        infoField.classList.remove('wrapped')
        button.attributes.clicked.nodeValue = 'true'
    }else{
        button.classList.remove('bi-arrow-bar-up')
        button.classList.add('bi-arrow-bar-down')
        infoField.classList.add('wrapped')
        button.attributes.clicked.nodeValue = 'false'
    }

    renderElement('h3', infoField, {textContent: 'Movie Info'}, {class: 'text-align-center'})
    let RuntimeWrap = renderElement('p', infoField)
    let RuntimeInfo = renderElement('strong', RuntimeWrap, {textContent: 'Runtime: '})
    let RuntimeValue = renderElement('span', RuntimeWrap, {textContent: movie.Runtime !== 'N/A' ? movie.Runtime : 'No data'})

    let GenreWrap = renderElement('p', infoField)
    let GenreInfo = renderElement('strong', GenreWrap, {textContent: 'Genre: '})
    let GenreValue = renderElement('span', GenreWrap, {textContent: movie.Genre !== 'N/A' ? movie.Genre : 'No data'})

    let LanguageWrap = renderElement('p', infoField)
    let LanguageInfo = renderElement('strong', LanguageWrap, {textContent: 'Language: '})
    let LanguageValue = renderElement('span', LanguageWrap, {textContent: movie.Language !== 'N/A' ? movie.Language : 'No data'})

    let DirectorWrap = renderElement('p', infoField)
    let DirectorInfo = renderElement('strong', DirectorWrap, {textContent: 'Director: '})
    let DirectorValue = renderElement('span', DirectorWrap, {textContent: movie.Director !== 'N/A' ? movie.Director : 'No data'})

    let WriterWrap = renderElement('p', infoField)
    let WriterInfo = renderElement('strong', WriterWrap, {textContent: 'Writer: '})
    let WriterValue = renderElement('span', WriterWrap, {textContent: movie.Writer !== 'N/A' ? movie.Writer : 'No data'})

    let ActorsWrap = renderElement('p', infoField)
    let ActorsInfo = renderElement('strong', ActorsWrap, {textContent: 'Actors: '})
    let ActorsValue = renderElement('span', ActorsWrap, {textContent: movie.Actors !== 'N/A' ? movie.Actors : 'No data'})

    renderElement('p', infoField, {textContent: movie.Plot})
})