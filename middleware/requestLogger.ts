import { Request, Response, NextFunction } from 'express'

export default function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction){
    const start = new Date().getTime();
    
    res.on('finish', ()=>{
        const elapsed = new Date().getTime() - start;
        console.info(`method: ${req.method}, url: ${req.originalUrl}, code: ${res.statusCode}, time: ${elapsed}ms`)  
    })
    next();
}