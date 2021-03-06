const body = document.querySelector('body')
const moviesDivs = []
init()

function init(){
    body.style.backgroundImage = `url(${movies[0].poster})`
    body.classList.add('main-page-body')
    console.log(movies)
    for(let i = 0; i < 10; i++){
        moviesDivs.push(document.querySelector(`#movie-${i}`))
    }
}

function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)

    );
}


const box = document.querySelector('.box');
const message = document.querySelector('#message');

document.addEventListener('scroll', function () {
    for(let i = 0; i < moviesDivs.length; i++){
        if(isInViewport(moviesDivs[i])){
            body.style.backgroundImage = `url(${movies[i].poster})`
            return
        }
    }

}, {
    passive: true
});

function wrap(movieId, buttonId){
    let movieInfo = document.querySelector(`#${movieId}`)
    let button = document.querySelector(`#${buttonId}`)
    if(button.attributes.clicked.nodeValue === 'false'){
        button.classList.remove('bi-info-square')
        button.classList.add('bi-info-square-fill')
        movieInfo.classList.remove('wrapped')
        button.attributes.clicked.nodeValue = 'true'
    }else{
        button.classList.remove('bi-info-square-fill')
        button.classList.add('bi-info-square')
        movieInfo.classList.add('wrapped')
        button.attributes.clicked.nodeValue = 'false'
    }
}