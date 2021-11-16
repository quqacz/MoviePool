module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

module.exports.isUser = (req, res, next)=>{
    if(!res.locals.currentUser){
        return res.redirect('/login')
    }else{
        if(req.params.id === res.locals.currentUser._id.toString()){
            return next()
        }else{
            return res.redirect('/user/'+res.locals.currentUser._id.toString())
        }
    }
}