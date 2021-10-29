if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

import express, { Request, Response} from "express";
import { requestLogger } from "./middleware/requestLogger";

const port = process.env.PORT || 3000;

const mongoose = require('mongoose')

const app = express()

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/MoviePool'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.error.bind(console, 'connection error:'))
db.once("open", ()=>{
    console.log("Database connected")
})

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

app.get('/', requestLogger, (req: Request, res: Response)=>{
    res.render('index');
})

app.get('/login', (req: Request, res: Response)=>{
    res.render('login')
})

app.get('/register', (req: Request, res: Response)=>{
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