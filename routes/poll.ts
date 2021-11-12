import express, {Request, Response, NextFunction } from 'express'
import { isLoggedIn } from '../middleware/permitions'
const Poll = express()

Poll.get('/', isLoggedIn, (req: Request, res: Response)=>{
    res.render('poll')
})

export default Poll