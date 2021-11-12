import { Request, Response, NextFunction } from "express"

function isLoggedIn(req: Request, res: Response, next: NextFunction){
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

function isUser(req: Request, res: Response, next: NextFunction){
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

async function alreadyFriends(req: Request, res: Response, next: NextFunction){

}

export { isLoggedIn, isUser, alreadyFriends}