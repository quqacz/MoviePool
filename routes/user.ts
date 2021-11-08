import express, {Request, Response, NextFunction } from 'express'
const Users = express()

Users.get('/:id', (req: Request, res: Response)=>{
    res.render('userProfile')
})

export default Users