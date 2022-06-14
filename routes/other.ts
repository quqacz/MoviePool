import express, {Request, Response, NextFunction } from 'express'
const Other = express.Router()

Other.get('*', (req: Request, res: Response)=>{
    res.render('other')
})

Other.post('*', (req: Request, res: Response)=>{
    res.render('other')
})

Other.put('*', (req: Request, res: Response)=>{
    res.render('other')
})

Other.delete('*', (req: Request, res: Response)=>{
    res.render('other')
})

Other.patch('*', (req: Request, res: Response)=>{
    res.render('other')
})
export default Other