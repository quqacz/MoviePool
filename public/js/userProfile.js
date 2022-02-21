const wrapButton = document.querySelector('.friends-button')
const friendsList = document.querySelector('#friend-list')
const icon = document.querySelector('#wrappButton')

let wrapped = false

function wrap(){
    if(!wrapped){
        friendsList.classList.add('wrapped')
        icon.classList.remove('bi-arrow-bar-up')
        icon.classList.add('bi-arrow-bar-down')
        wrapped = !wrapped
    }else{
        friendsList.classList.remove('wrapped')
        icon.classList.add('bi-arrow-bar-up')
        icon.classList.remove('bi-arrow-bar-down')
        wrapped = !wrapped
    }
}