import { Request, Response, NextFunction } from "express"

function isLoggedIn(req: Request, res: Response, next: NextFunction){
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

export { isLoggedIn }