import express, {Request, Response, NextFunction } from 'express'
const Poll = express()

Poll.get('/', (req: Request, res: Response)=>{
    res.render('poll')
})

export default Poll