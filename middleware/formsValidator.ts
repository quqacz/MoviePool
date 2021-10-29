import { Request, Response, NextFunction } from "express";

function registerValidator(req: Request, res: Response, next: NextFunction){
    if(req.body.username && req.body.nickname && req.body.password){
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

export { registerValidator, loginValidator }