if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

import { AxiosResponse } from "axios"
import express, { Request, Response} from "express"
import { registerValidator, loginValidator, movieSearch } from "./middleware/formsValidator"
import { ShortMovieInfo } from "./types/types"

const mongoose = require('mongoose')
const app = express()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const methodOverride = require('method-override')
const axios = require('axios')

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
app.get('/', (req: Request, res: Response)=>{
    res.render('index');
})

app.get('/login', (req: Request, res: Response)=>{
    res.render('login')
})

app.post('/login', loginValidator, passport.authenticate('local', {failureRedirect: '/login'}), (req: Request, res: Response)=>{
    res.redirect('/');
})

app.get('/register', (req: Request, res: Response)=>{
    res.render('register')
})

app.post('/register', registerValidator, async(req: Request, res: Response)=>{
    try{
        const { username, nickname, password } = req.body;
        console.log(username, nickname, password);
        const user = new User({username, nickname});
        const regUser = await User.register(user, password);
        console.log(regUser)
        req.login(regUser, err=>{
            if(err){
                console.log(err)
                res.redirect('/register')
            }else{
                res.redirect('/');
            }
        });
    } catch(e){
        console.log(e);
        res.redirect('/register')
    }
})

app.get('/logout', (req,res)=>{
    req.logOut();
    res.redirect('/');
})

app.get('/pool', (req: Request, res: Response)=>{
    res.render('pool')
})

app.post('/pool/add', movieSearch, async(req: Request, res: Response)=>{
    const { movieName } = req.body
    axios.get(`http://www.omdbapi.com/?t=${movieName}&apikey=${process.env.MOVIE_API_KEY}&`)
    .then((response: AxiosResponse) => {
        const movies: ShortMovieInfo[] = response.data
        res.json(response.data)
    })
    .catch((error: any) => {
        console.log(error);
        res.redirect('/pool')
    });
})

app.get('/user/:id', (req: Request, res: Response)=>{
    res.render('userProfile')
})

app.listen(port, ()=>{
    console.log(`app runs on port ${port}`);
})