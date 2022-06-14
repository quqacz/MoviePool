import { Request, Response, NextFunction } from "express";

const userNameRegEX = new RegExp(/^[a-zA-Z0-9_-]{3,16}$/)
const passwordRegEX = new RegExp(/^[a-zA-Z0-9_!@#$%^&*]{6,32}$/) 

function registerValidator(req: Request, res: Response, next: NextFunction){
  if(req.body.username && req.body.nickname && req.body.password && userNameRegEX.test(req.body.username) && userNameRegEX.test(req.body.nickname) && passwordRegEX.test(req.body.password)){
      next();
  }else{
    return res.redirect('/register');  
  }
}

function loginValidator(req: Request, res: Response, next: NextFunction){
  if(req.body.username && req.body.password){
      next();
  }else{
    return res.redirect('/login');  
  }
}

function movieSearch(req: Request, res: Response, next: NextFunction){
  if(req.body.movieName){
    next()
  }else{
    console.log('no movie name was given')
    return res.redirect('/poll')
  }
}

export { registerValidator, loginValidator, movieSearch }