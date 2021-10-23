import express, { Request, Response} from "express";
import { requestLogger } from "./middleware/requestLogger";

const app = express();
const port = 8000;

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