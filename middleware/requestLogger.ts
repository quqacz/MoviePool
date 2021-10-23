import { Request, Response, NextFunction } from "express";

function requestLogger(req: Request, res: Response, next: NextFunction){
    next();
}

export { requestLogger }