const movieName = document.querySelector('#movieName');
const moviesWrapper = document.querySelector('#moviesWrapper')
function getMovies(){
    socket.emit('fetchMovies', movieName.value)
}

function renderMovies(movies){
    resetMoviesRender()
    for(let i = 0; i < movies.length; i++){
        let wrap = document.createElement('div')

        let title = document.createElement('h5')
        title.innerHTML = movies[i].Title

        let year = document.createElement('h6')
        year.innerHTML = movies[i].Year

        let img = document.createElement('img')
        img.setAttribute('src', movies[i].Poster)

        let hr = document.createElement('hr')

        wrap.appendChild(title)
        wrap.appendChild(year)
        wrap.appendChild(img)  
        wrap.appendChild(hr) 
        moviesWrapper.appendChild(wrap)
    }
}

function renderError(arg){
    resetMoviesRender()
    let wrap = document.createElement('div')
    let p = document.createElement('p')
    p.textContent = arg;
    wrap.appendChild(p)
    moviesWrapper.appendChild(wrap)
}

function resetMoviesRender(){
    moviesWrapper.innerHTML = ''
}