const movieName = document.querySelector('#movieName');
const moviesWrapper = document.querySelector('#moviesWrapper')

socket.emit('joinRoom', roomId)

function getMovies(){
    socket.emit('fetchMovies', movieName.value)
}

function renderMovies(movies){
    for(let i = 0; i < movies.length; i++){
        let wrap = document.createElement('div')

        let title = document.createElement('h5')
        title.innerHTML = movies[i].Title

        let year = document.createElement('h6')
        year.innerHTML = movies[i].Year

        let img = document.createElement('img')
        img.setAttribute('src', movies[i].Poster)

        let addButton = document.createElement('button')
        addButton.type = "button"
        addButton.innerHTML = "Add to queue"
        addButton.addEventListener('click', function(){
            console.log(movies[i])
            socket.emit('addToQueue', movies[i].imdbID)
        })

        let hr = document.createElement('hr')

        wrap.appendChild(title)
        wrap.appendChild(year)
        wrap.appendChild(img)  
        wrap.appendChild(addButton)
        wrap.appendChild(hr) 
        moviesWrapper.appendChild(wrap)
    }
}

function renderError(arg){
    let wrap = document.createElement('div')
    let p = document.createElement('p')
    p.textContent = arg;
    wrap.appendChild(p)
    moviesWrapper.appendChild(wrap)
}

function resetMoviesRender(){
    moviesWrapper.innerHTML = ''
}

function showNumberOfMovies(number, movieName){
    let wrap = document.createElement('div')
    let h = document.createElement('h3')
    h.innerHTML = `There ${number === 1 ?  'is one movie': 'are '+number+' movies '} for fraze "${movieName}"`
    wrap.appendChild(h)
    moviesWrapper.appendChild(wrap)
}

function renderPagination(total, movieName, page = 1){
    let wrap = document.createElement('div')

    let innerWrap = document.createElement('div')
    innerWrap.classList.add('container')

    if(page > 1){
        let prev = document.createElement('button')
        prev.innerHTML = '<'
        prev.addEventListener('click', function(){
            socket.emit('fetchMoreMovies', movieName, page - 1)
        })
        innerWrap.appendChild(prev)
    }
    if(page !== 1 && page !== Math.ceil(total / 10)){
        let current = document.createElement('button')
        current.innerHTML = page
        innerWrap.appendChild(current)
    }
    if(page < Math.ceil(total / 10)){
        let next = document.createElement('button')
        next.innerHTML = '>'
        next.addEventListener('click', function(){
            socket.emit('fetchMoreMovies', movieName, page + 1)
        })
        innerWrap.appendChild(next)
    }

    wrap.appendChild(innerWrap)
    moviesWrapper.appendChild(wrap)
}