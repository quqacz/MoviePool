if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

import express, { NextFunction, Request, Response} from "express"
import { getUpcomingMovies } from "./apiRequests"
import requestLoggerMiddleware from './middleware/requestLogger'

import Auth from "./routes/auth"
import Poll from "./routes/poll"
import Users from "./routes/user"
import Other from "./routes/other"

const mongoose = require('mongoose')
const app = express()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const methodOverride = require('method-override')
const axios = require('axios')

// db models
const User = require('./models/user')
const MoviesCash = require('./models/upcomingMovies')
const Movie = require('./models/movie')

// cash stuff to save api calls and reduce loading time 
// let MoviesCash = {
//     lastFetched: `${new Date().getFullYear}${new Date().getMonth}${new Date().getDay}`,
//     moviesDetails: ['']
// }

// .env constants
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/MoviePoll'

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

// other required stuff
app.use(requestLoggerMiddleware)

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.currentUser = req.user;
    next();
})

// routes
app.get('/', async(req: Request, res: Response)=>{
    let requestTime = `${new Date().getFullYear}${new Date().getMonth}${new Date().getDay}`.toString()
    const cashe = await MoviesCash.find({date: requestTime});
    if(!cashe.length){
        const newDayData = new MoviesCash({date: requestTime});
        if(cashe.length === 0){
            let ids = await getUpcomingMovies();
            
            for(let i = 0; i < ids.length; i++){
                let id = ids[i].id.split('/');
                let parsedId = id[2];
                const movie = await axios.get(`http://www.omdbapi.com/?i=${parsedId}&apikey=${process.env.MOVIE_API_KEY}&`)
                let data = movie.data;
                const newMovie = new Movie({
                    imdbId: data.imdbID,
                    year: data.Year,
                    poster: data.Poster,
                    plot: data.Plot
                })
                const savedMovie = await newMovie.save();
                newDayData.movies.push(newMovie)
            }
            const upMovies = await newDayData.save();
        }
        console.log(newDayData.movies);
        res.render('index', {movies: newDayData.movies})
    }else{
        res.render('index', {movies: cashe.movies})
    }
})

app.use('', Auth);
app.use('/poll', Poll)
app.use('/user', Users)
app.use('', Other)

app.listen(port, ()=>{
    console.log(`app runs on port ${port}`);
})