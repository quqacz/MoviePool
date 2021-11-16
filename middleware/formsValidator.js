
module.exports.registerValidator = (req, res, next) =>{
  if(req.body.username && req.body.nickname && req.body.password){
      next();
  }else{
    console.log('missing arguments for api call')
    console.log(req.body);
    return res.redirect('/register');  
  }
}

module.exports.loginValidator = (req, res, next) =>{
  if(req.body.username && req.body.password){
      next();
  }else{
    console.log('missing arguments for api call')
    return res.redirect('/login');  
  }
}

module.exports.movieSearch = (req, res, next) =>{
  if(req.body.movieName){
    next()
  }else{
    console.log('no movie name was given')
    return res.redirect('/poll')
  }
}