const express = require('express')
const Other = express()

Other.get('*', (req, res)=>{
    res.send('404 XD')
})

Other.post('*', (req, res)=>{
    res.send('404 XD')
})

Other.put('*', (req, res)=>{
    res.send('404 XD')
})

Other.delete('*', (req, res)=>{
    res.send('404 XD')
})

Other.patch('*', (req, res)=>{
    res.send('404 XD')
})
module.exports = Other