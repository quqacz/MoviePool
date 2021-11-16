const express = require('express')
const { isLoggedIn } = require('../middleware/permitions')
const Poll = express()

Poll.get('/', isLoggedIn, (req, res)=>{
    res.render('poll')
})

module.exports = Poll