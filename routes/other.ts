import express, {Request, Response, NextFunction } from 'express'
const Other = express()

Other.get('*', (req: Request, res: Response)=>{
    res.send('404 XD')
})

Other.post('*', (req: Request, res: Response)=>{
    res.send('404 XD')
})

Other.put('*', (req: Request, res: Response)=>{
    res.send('404 XD')
})

Other.delete('*', (req: Request, res: Response)=>{
    res.send('404 XD')
})

Other.patch('*', (req: Request, res: Response)=>{
    res.send('404 XD')
})
export default Other