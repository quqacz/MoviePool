import express, { Request, Response} from "express";

const app = express();
const port = 8000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

app.get('/', (req: Request, res: Response)=>{
    res.render('index');
})

app.listen(port, ()=>{
    console.log(`app runs on port ${port}`);
})