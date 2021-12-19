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
    for(let i = 0; i < movies.length; i++){
        const wrap = renderElement('div', moviesWrapper)
        renderElement('h5', wrap, {innerHTML: movies[i].Title})
        renderElement('h6', wrap, {innerHTML: movies[i].Year})
        renderElement('img', wrap, {}, {src: movies[i].Poster})
        renderElement('button', wrap, {type: 'button', innerHTML: 'Add to queue', onclick: function(){socket.emit('addToQueue', movies[i].imdbID)}})
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
    renderElement('h3', wrap, {innerHTML: `There ${number === 1 ?  'is one movie': 'are '+number+' movies '} for fraze "${movieName}"`})
}

function renderPagination(total, movieName, page = 1){
    const wrap = renderElement('div', moviesWrapper)
    const innerWrap = renderElement('div', wrap, {}, {class: 'container'})

    if(page > 1){
        renderElement('button', innerWrap, {innerHTML: '<', onclick: function(){ socket.emit('fetchMoreMovies', movieName, page - 1)}})
    }
    if(page !== 1 && page !== Math.ceil(total / 10)){
        renderElement('button', innerWrap, {innerHTML: page})
    }
    if(page < Math.ceil(total / 10)){
        renderElement('button', innerWrap, {innerHTML: '>', onclick: function(){ socket.emit('fetchMoreMovies', movieName, page + 1)}})
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
    renderElement('h5', wrapp, {textContent: voters+ ' voter' + (voters > 1 ? 's ': ' ') + 'is in the room'})

    if(moviesToAdd !== undefined){
        renderElement('h4', wrapp, {textContent: 'You can add ' + moviesToAdd +' more movie'+ (moviesToAdd > 1 ? 's' : '')})
    }

    if(hostId){
        const startVoting = renderElement('button', wrapp, {type: 'button', innerHTML: 'Start voting'})
        if(movies > 2){
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
        const wrap = renderElement('div', inviteList)
        renderElement('p', wrap, {textContent: friendsToInvite[i].nickname})
        renderElement('button', wrap, {type: 'button', innerHTML: 'Invite', onclick: function(){socket.emit('sendRoomInvite', friendsToInvite[i]._id, roomId, userId)}})
    }

    for(let i = 0; i < invitedFriends.length; i++){
        const wrap = renderElement('div', inviteList)
        renderElement('p', wrap, {textContent: invitedFriends[i].to.nickname})
        renderElement('button', wrap, {type: 'button', innerHTML: invitedFriends[i].accepted ? 'Accepted' : 'Pending', disabled: true})
    }
}

function renderVotingQueue(movies){
    resetAddingMoviesInterface()
    resetVotingInterface()
    for(let i = 0; i < movies.length; i++){
        const wrap = renderElement('div', voting)
        renderElement('h3', wrap, {textContent: movies[i].Title})
        renderElement('img', wrap, {}, {src: movies[i].Poster})
        renderElement('p', wrap, {textContent: `Released ${movies[i].Released} \t Runtime ${movies[i].Runtime}`})
        renderElement('p', wrap, {textContent: movies[i].Plot})
        renderElement('button', wrap, {type: 'button', innerHTML: 'YES', onclick: function(){votes[movies[i].imdbID] = 1; wrap.parentNode.removeChild(wrap)}})
        renderElement('button', wrap, {type: 'button', innerHTML: 'SKIP', onclick: function(){votes[movies[i].imdbID] = 0; wrap.parentNode.removeChild(wrap)}})
        renderElement('button', wrap, {type: 'button', innerHTML: 'NO', onclick: function(){votes[movies[i].imdbID] = -1; wrap.parentNode.removeChild(wrap)}})
    }
    renderElement('button', voting, {type: 'button', innerHTML: 'End Voting', onclick: function(){socket.emit('sendVote', votes)}})
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
        }
    }

    if(parent)
        parent.appendChild(el)
        
    return el
}