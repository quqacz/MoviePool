if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

import express, { Request, Response} from "express";
import { requestLogger } from "./middleware/requestLogger";

const mongoose = require('mongoose')
const app = express()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const methodOverride = require('method-override')

// db models

const User = require('./models/user')

// .env constants
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/MoviePool'

// db setup
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.error.bind(console, 'connection error:'))
db.once("open", ()=>{
    console.log("Database connected")
})

// express setup
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// sesion config
const secret = process.env.SECRET || 'thisisagoodsecretforfuckssake';

const sessionConfig = {
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
app.get('/', requestLogger, (req: Request, res: Response)=>{
    res.render('index');
})

app.get('/login', (req: Request, res: Response)=>{
    res.render('login')
})

app.get('/register', (req: Request, res: Response)=>{
    res.render('register')
})

app.post('/register', (req: Request, res: Response)=>{
    const { name, lastName } = req.body;
    console.log(name, lastName);
    res.render('register')
})

app.get('/pool', (req: Request, res: Response)=>{
    res.render('pool')
})

app.get('/user/:id', (req: Request, res: Response)=>{
    res.render('userProfile')
})

app.listen(port, ()=>{
    console.log(`app runs on port ${port}`);
})