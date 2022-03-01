const mainWrapper = document.querySelector('#mainWrapper')
const movieName = document.querySelector('#movieName');
const addingMovies = document.querySelector('#addingMovies')
const voting = document.querySelector('#voting')
const moviesWrapper = document.querySelector('#moviesWrapper')
const statsWrapper = document.querySelector('#statsWrapper')
const inviteList = document.querySelector('#inviteList')

let numberOfMoviesToAdd = undefined;
let moviesData = []
const votes = {}
socket.emit('joinRoom', roomId, userId)

if(parseDataFromSite){
    parseMoviesData();
    renderVotingQueue(moviesData)
}

function getMovies(){
    socket.emit('fetchMovies', movieName.value)
}

function inviteFriend(friendId, roomId, hostId){
    socket.emit('sendRoomInvite', friendId, roomId, hostId)
}

function renderMovies(movies){
    console.log(movies[0])
    for(let i = 0; i < movies.length; i++){
        const wrap = renderElement('div', moviesWrapper, {},
            {class: 'width-60 space-25 movie-data-wrapper'})
        renderElement('h3', wrap, {innerHTML: movies[i].Title})
        renderElement('h4', wrap, {innerHTML: movies[i].Year})
        const div = renderElement('div', wrap)
        renderElement('img', div, {}, {src: movies[i].Poster, class: 'movie-poster'})
        renderElement('div', wrap, {
            id: `movie${i}`},
            {class: 'p-2 width-60 wrapped space-25'})
        let infoWrapper = renderElement('div', wrap, {}, {class: 'text-align-center'})
        let button = renderElement('button', infoWrapper,{
            onclick: function(){socket.emit('fetchFullMovieDetails', movies[i].imdbID, `movie${i}`, `wrap${i}`)}
        },{
            class: 'friends-button'
        })
        renderElement('i', button, {
            id: `wrap${i}`
        }, {
            class: 'bi bi-arrow-bar-down',
            clicked: 'false'
        })


        renderElement('button', wrap, 
            {type: 'button', innerHTML: 'Add to queue', onclick: function(){socket.emit('addToQueue', movies[i].imdbID)}},
            {class: 'start-button active space-25'})
        renderElement('hr', wrap)
    }
}

function renderError(arg){
    let wrap = renderElement('div', moviesWrapper)
    renderElement('p', wrap, {textContent: arg})
}

function resetMoviesRender(){
    if(moviesWrapper)
        moviesWrapper.innerHTML = ''
}

function resetStatsRender(){
    if(statsWrapper)
        statsWrapper.innerHTML = ''
}

function resetInviteList(){
    if(inviteList)
        inviteList.innerHTML = ''
}

function resetAddingMoviesInterface(){
    if(addingMovies)
        addingMovies.innerHTML = ''
}

function resetVotingInterface(){
    voting.innerHTML = ''
}

function showNumberOfMovies(number, movieName){
    const wrap = renderElement('div', moviesWrapper)
    renderElement('h3', wrap, 
    {innerHTML: `There ${number === 1 ?  'is one movie': 'are '+number+' movies '} for fraze "${movieName}"`},
    {class: 'text-align-center'})
}

function renderPagination(total, movieName, page = 1){
    const wrap = renderElement('div', moviesWrapper)
    const innerWrap = renderElement('div', wrap, {}, {class: 'container button-group btn-toolbar'})

    if(page > 1){
        renderElement('button', innerWrap, 
            {innerHTML: '<', onclick: function(){ socket.emit('fetchMoreMovies', movieName, page - 1)}},
            {class: 'btn btn-secondary'})
    }
    if(page !== 1 && page !== Math.ceil(total / 10)){
        renderElement('button', innerWrap, 
            {innerHTML: page},
            {class: 'btn btn-secondary'})
    }
    if(page < Math.ceil(total / 10)){
        renderElement('button', innerWrap, 
            {innerHTML: '>', onclick: function(){ socket.emit('fetchMoreMovies', movieName, page + 1)}},
            {class: 'btn btn-secondary'})
    }
}

function renderRoomStats(movies, voters, moviesToAdd){
    if(numberOfMoviesToAdd === undefined){
        numberOfMoviesToAdd = moviesToAdd
    }
    if(moviesToAdd){
        numberOfMoviesToAdd = moviesToAdd
    }
    if(moviesToAdd === undefined){
        moviesToAdd = numberOfMoviesToAdd
    }
    
    resetStatsRender()
    const wrapp = renderElement('div', statsWrapper);
    renderElement('h4', wrapp, {textContent: 'There '+ (movies > 1 ? 'are ': 'is ')+''+ movies + ' movie' + (movies > 1 ? 's ': ' ') + 'in the queue'})
    renderElement('h4', wrapp, {textContent: voters+ ' voter' + (voters > 1 ? 's ': ' ') + 'is in the room'})

    if(moviesToAdd !== undefined){
        renderElement('h4', wrapp, {textContent: 'You can add ' + moviesToAdd +' more movie'+ (moviesToAdd > 1 ? 's' : '')})
    }

    if(hostId){
        const startVoting = renderElement('button', wrapp, 
        {type: 'button', innerHTML: 'Start voting'}, 
        {class: 'start-button'})
        if(movies > 2){
            startVoting.classList.add('active')
            startVoting.addEventListener('click', function(){
                socket.emit('startVoting')
            })
        }else{
            startVoting.disabled = true
        }
    }
}

function renderInvites(friendsToInvite, invitedFriends){
    resetInviteList()
    for(let i = 0; i < friendsToInvite.length; i++){
        const wrap = renderElement('div', inviteList, {}, 
            {class: 'row data-row'})
        const col1 = renderElement('div', wrap, {},
            {class: 'col'})
        const col2 = renderElement('div', wrap, {},
            {class: 'col'})
        renderElement('strong', col1, {textContent: friendsToInvite[i].nickname})
        renderElement('button', col2, 
            {type: 'button', innerHTML: '<strong>Invite</strong>', onclick: function(){socket.emit('sendRoomInvite', friendsToInvite[i]._id, roomId, userId)}},
            {class: 'wide-button invitation-button'})
    }

    for(let i = 0; i < invitedFriends.length; i++){
        const wrap = renderElement('div', inviteList, {}, 
        {class: 'row data-row'})
        const col1 = renderElement('div', wrap, {},
        {class: 'col'})
        const col2 = renderElement('div', wrap, {},
        {class: 'col text-align-center'})
        renderElement('strong', col1, {textContent: invitedFriends[i].to.nickname})
        renderElement('strong', col2, {innerHTML: invitedFriends[i].accepted ? 'Accepted' : 'Pending'})
    }
}

function renderVotingQueue(movies){
    resetAddingMoviesInterface()
    resetVotingInterface()
    for(let i = 0; i < movies.length; i++){
        const wrap = renderElement('div', voting, {},
        {class: 'width-60 space-25 movie-data-wrapper'})
        renderElement('h3', wrap, {textContent: movies[i].Title})
        renderElement('img', wrap, {}, {src: movies[i].Poster, class: 'movie-poster'})
        renderElement('p', wrap, {textContent: `Released: ${movies[i].Released}, Runtime: ${movies[i].Span}`})
        renderElement('p', wrap, {textContent: movies[i].Plot})
        const innerWrap = renderElement('div', wrap, {}, 
            {class: 'container button-group btn-toolbar'})
        renderElement('button', innerWrap, 
            {type: 'button', innerHTML: 'YES', onclick: function(){votes[movies[i].imdbID] = 1; wrap.parentNode.removeChild(wrap)}},
            {class: 'btn btn-secondary'})
        renderElement('button', innerWrap, 
            {type: 'button', innerHTML: 'SKIP', onclick: function(){votes[movies[i].imdbID] = 0; wrap.parentNode.removeChild(wrap)}},
            {class: 'btn btn-secondary'})
        renderElement('button', innerWrap, 
            {type: 'button', innerHTML: 'NO', onclick: function(){votes[movies[i].imdbID] = -1; wrap.parentNode.removeChild(wrap)}},
            {class: 'btn btn-secondary'})
        renderElement('hr', wrap)
    }
    renderElement('button', voting, 
        {type: 'button', innerHTML: 'End Voting', onclick: function(){socket.emit('sendVote', votes)}},
        {class: 'btn btn-secondary space-25'})
}

function renderWaitingAnim(){
    resetVotingInterface()
    const wrap = renderElement('div', voting, {}, {class: 'container'})
    renderElement('h3', wrap, {textContent: 'Voting in progress'})
    renderElement('p', wrap, {textContent: 'Waiting for others to end voting'})
}

function renderWinnerInfo(movie){
    resetVotingInterface()
    const wrap = renderElement('div', voting, {}, 
        {class: 'width-60 space-25 movie-data-wrapper'})
    renderElement('h1', wrap, {textContent: movie.Title})
    renderElement('h4', wrap, {textContent: `Released ${movie.Released}, runtime ${movie.Runtime}`})
    renderElement('img', wrap, {}, {src: movie.Poster, class: 'movie-poster'})
    renderElement('p', wrap, {textContent: movie.Plot}, {class: 'space-25'})
    renderElement('p', wrap, {textContent: `Score ${movie.imdbRating} from ${movie.imdbVotes} votes`})
}

function parseMoviesData(){
    const titles = document.querySelectorAll('.movie_title')
    const posters = document.querySelectorAll('.movie_poster')
    const releases = document.querySelectorAll('.movie_release')
    const spans = document.querySelectorAll('.movie_span')
    const plots = document.querySelectorAll('.movie_plot')
    const ids = document.querySelectorAll('.movie_id')

    for(let i = 0; i < titles.length; i++){
        moviesData.push({
            Title: titles[i].textContent,
            Poster: posters[i].currentSrc,
            Released: releases[i].textContent,
            Span: spans[i].textContent,
            Plot: plots[i].textContent,
            imdbID: ids[i].textContent
        })
    }
}

// options keys:
// innerHtml, textContent, type, onclick, disabled, role

// attributes:
// src, css classes
function renderElement(element, parent = undefined, options = {}, attributes = {}){
    const el = document.createElement(element)
    const optionsKeys = Object.keys(options)
    const attributesKeys = Object.keys(attributes)

    for(let i = 0; i < optionsKeys.length; i++){
        el[optionsKeys[i]] = options[optionsKeys[i]]
    }

    for(let i = 0; i < attributesKeys.length; i++){
        switch(attributesKeys[i]){
            case 'src':
                el.setAttribute('src', attributes[attributesKeys[i]]) 
                break
            case 'class':
                let classes = attributes[attributesKeys[i]].split(' ')
                for(let j = 0; j < classes.length; j++){
                    el.classList.add(classes[j])
                }
                break
            default:
                el.setAttribute(attributesKeys[i], attributes[attributesKeys[i]])
                break
        }
    }

    if(parent)
        parent.appendChild(el)
        
    return el
}