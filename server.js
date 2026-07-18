const express = require("express");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const WebSocket = require("ws");



const app = express()
app.use(bodyparser.json());
app.use(cookieParser())
console.log("loaded")

const users = {}
const userIDs=[]
let guesses = {}

let current_state="START";

let MAX_USERS = 4;

function getCookie(cookie, key){
    const cookies = cookie.split(";");
    for (let i = 0; i<cookies.length; i++){
        let item = cookies[i].trim().split("=");
        if (item[0]===key){
            return item[1];
        }
    }
    return null;
}

let questions =[
    
        {
            "num":"Test",
            "text":"When was Katja born",
            "img":"0.jpeg",
            "correctAnswer":0,
            "answers":[
                "1966",
                "1967",
                "1968",
                "1969"
            ],
            "points":0,
            "time":14
        },
        {
            "num":"1",
            "text":"Where did Katja do a bike tour?",
            "img":"null",
            "correctAnswer":2,
            "answers":[
                "Australia",
                "USA",
                "Egypt",
                "Spain"
            ],
            "points":100,
            "time":14
        },
        {
            "num":"2",
            "text":"Where was this picture taken?",
            "img":"2.jpg",
            "correctAnswer":3,
            "answers":[
                "Germany",
                "Vanuatu",
                "USA",
                "Russia"
            ],
            "points":100,
            "time":22
        },
        {
            "num":"3",
            "text":"When was the last time that the 1.FC Köln won the Bunderliga?",
            "img":"3.png",
            "correctAnswer":1,
            "answers":[
                "1963/1964",
                "1977/1978",
                "2012/2013",
                "1985/1986"
            ],
            "points":100,
            "time":14
        },
        
        {
            "num":"4",
            "text":"How many academic titles does she have",
            "img":"4.jpg",
            "correctAnswer":3,
            "answers":[
                "0",
                "1",
                "2",
                "3"
            ],
            "points":100,
            "time":14
        },
        {
            "num":"5",
            "text":"Where have we never spent our summer holidays?",
            "img":"5.JPG",
            "correctAnswer":1,
            "answers":[
                "Andorra",
                "Armenia",
                "Litauen",
                "Montenegro"
            ],
            "points":100,
            "time":14
        },
        {
            "num":"6",
            "text":"How long has Katja been working for the EU?",
            "img":"6.jpg",
            "correctAnswer":1,
            "answers":[
                "16",
                "22",
                "26",
                "20"
            ],
            "points":100,
            "time":14
        },
        {
            "num":"7",
            "text":"When did Jörg and Katja get married?",
            "img":"7.jpg",
            "correctAnswer":0,
            "answers":[
                "2005",
                "2003",
                "2009",
                "2002"
            ],
            "points":100,
            "time":14
        },
        {
            "num":"8",
            "text":"What animals did Katja have when she was a child?",
            "img":"null",
            "correctAnswer":1,
            "answers":[
                "A Cat",
                "A Dog",
                "A Hamster",
                "None"
            ],
            "points":100,
            "time":14
        },
        {
            "num":"9",
            "text":"Why did Katja get curious about working in public health?",
            "img":"9.jpg",
            "correctAnswer":3,
            "answers":[
                "It was her big dream",
                "A friend was working there",
                "She got an invitation to work there",
                "She read about it in a newspaper article"
            ],
            "points":100,
            "time":20
        },
        {
            "num":"10",
            "text":"Which sport does Katja not watch?",
            "img":"10.JPG",
            "correctAnswer":2,
            "answers":[
                "Football",
                "Tennis",
                "Basketball",
                "Ski Jumping"
            ],
            "points":100,
            "time":14
        }
    
]
let currentQuestionIndex=0;
let timeUntilEndOfQuestion = 0;

let current_question = {}
function nextQuestion(){
    guesses={};
    current_question = questions[currentQuestionIndex];
    currentQuestionIndex++;
    console.log(current_question)
    console.log(currentQuestionIndex);
    let time = current_question.time;
    timeUntilEndOfQuestion = Date.now() + time*1000;
}

const wss = new WebSocket.Server({port:8080});

class BackLog{
    state=null;
    name=null;
    ws=null;

    constructor(name, ws, state){
        this.ws=ws;
        this.state=state;
        this.name=name;
    }
}

const backlogs = {}

wss.on("connection", (ws, req) => {
    let name = getCookie(req.headers.cookie, "name");
    let state = getCookie(req.headers.cookie, "state");
    console.log("Connected "+name+" for state "+state);
    backlogs[name]=new BackLog(name, ws, state);
})


let compiledLeaderboard = "";

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index/index.html");
})

app.post("/next", (req, res)=>{
    console.log(current_state)
    if (current_state!="LEADERBOARD"){return res.sendStatus(300);}
    if (currentQuestionIndex>=questions.length){return res.sendStatus(301);}
    current_state="QUIZING"
    nextQuestion();
    for (const backlog of Object.values(backlogs)) {
        if (backlog.state==="leaderboard"){
            backlog.ws.send("next");
        }
    }
    res.sendStatus(200);
})

app.get("/style", (req, res)=>{
    res.sendFile(__dirname + "/public/style.css");
})

app.post("/register", (req, res) => {
    if (userIDs.length>=MAX_USERS){
        return res.sendStatus(402);
    }
    try {
            let name = req.body.name;

            let unique = !userIDs.includes(name);
            if (!unique){
                return res.sendStatus(400);
            }
            userIDs.push(name);
            users[name] = {"name":name, "points":0, "allowed":false}
            return res.sendStatus(200);
    } catch {
        return res.sendStatus(401);
    }
})

app.post("/start", (req, res) => {
    console.log(current_state)
    if (current_state!="START"){return res.sendStatus(300);}
    nextQuestion();
    for (const backlog of Object.values(backlogs)) {
        if (backlog.state==="waitStart"){
            backlog.ws.send("start");
        }
    }
    current_state="QUIZING"
    res.sendStatus(200);
})
app.post("/toLeaderboard", (req, res) => {
    console.log(current_state)
    if (current_state!="QUIZING"){return res.sendStatus(700);}
    current_state="LEADERBOARD"
    for (const name of userIDs){
        let user = users[name];
        let guess = guesses[name];
        let points = 0;
        if (guess!=null){
            points = guess.points;
            user.points+=points;
        }

        let backlog = backlogs[name];
        if (backlog==null){
            continue;
        }
        if (backlog.state==="waitAnswer"){
            backlog.ws.send("proceed");
        } else if (backlog.state==="guessing"){
            backlog.ws.send("proceed")
        }
    }
    compiledLeaderboard=JSON.stringify(users);
    res.sendStatus(200);
})
app.post("/topodium", (req, res)=>{
    console.log(current_state)
    if (current_state!="LEADERBOARD"){return res.sendStatus(300);}
    for (let name of userIDs){
        let backlog = backlogs[name];
        if (backlog==null){
            continue;
        }
        if (backlog.state==="waitAnswer"){
            backlog.ws.send("podium");
        } else if (backlog.state==="guessing"){
            backlog.ws.send("podium")
        } else if (backlog.state==="leaderboard"){
            backlog.ws.send("podium")
        }
    }
    res.sendStatus(200);
})


app.get("/leaderboard", (req, res) => {
    res.sendFile(__dirname + "/public/leaderboard/leaderboard.html");
})
app.get("/podium", (req, res) => {
    res.sendFile(__dirname + "/public/podium/podium.html");
})

app.get("/getquestion", (req, res)=>{
    console.log("Question")
    res.status(200).send(JSON.stringify(current_question));
})
app.get("/wait", (req, res)=>{
    res.status(200).sendFile(__dirname+"/public/wait/wait.html")
})
app.get("/control", (req, res)=>{
    res.sendFile(__dirname+"/public/control/control.html")
})

app.get("/getLeaderboard", (req, res)=>{
    res.status(200).send(compiledLeaderboard)
})

app.post("/submit", (req, res)=>{
    try {
        let name = req.cookies.name;
        let guess = req.body.guess;
        let time = Math.max(0, (timeUntilEndOfQuestion-Date.now())/1000);
        let points = Math.floor(time/current_question.time*current_question.points);
        if (guess!==current_question.correctAnswer){
            points=0;
        }
        guesses[name]={"guess":guess, "time":time, "points":points};

        res.status(200).send(JSON.stringify({"name":name, "guess":guess, "time":time, "points":points}));
    } catch {

    }
})

app.get("/quiz", (req, res)=>{
    res.sendFile(__dirname + "/public/quiz/quiz.html")
})



app.get("*", (req, res)=>{
    res.status(200).sendFile(__dirname +"/public"+ req.url);
})

app.listen(80)
