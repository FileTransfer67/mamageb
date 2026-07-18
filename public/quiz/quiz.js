let time=0;
let guesses=null;
let dataSave;
sendAwait("guessing", (res)=>{
    if (res==="proceed"){
        document.cookie="guessID=-1";
        document.cookie="points=0";
        window.open("/leaderboard", "_self");
    } else if (res==="podium"){
        window.open("/podium", "_self");
    }
})
function fetchQuestion(){
    const title = document.getElementById('title');
    const img = document.getElementById('img');
    const buttons = document.getElementsByClassName("quizbutton")
    fetch("/getQuestion").then(response => response.json()).then((data) => {
        dataSave=data;
        console.log(data);
        title.innerText = "Question "+data.num+": "+data.text;
        img.src = "img/"+ data.img;
        for (let i = 0; i<4; i++){
            buttons[i].innerHTML = data.answers[i];
            buttons[i].onclick = () => {
                guess(i);
            }
        }
        guesses=data.answers;
        time = data.time;
    }).then(()=>{
        const timer = document.getElementById("timer");
        const endTime = Date.now()+time*1000;

        setInterval(()=>{
            const currentTime = Date.now();
            const timeLeft = endTime - currentTime;
            if (timeLeft<=0){
                document.cookie="guess=null";
                document.cookie="guessID=-1";
                document.cookie="wait=answer";
                document.cookie="points=0";
                window.open("/wait", "_self")
            } else {
                const interpolate = Math.floor((timeLeft/10)/time);
                timer.style.width = interpolate+"%";
            }
        }, 10)
    })
}
fetchQuestion();
function guess(id){
    document.cookie="guess="+guesses[id];
    document.cookie="guessID="+id;
    document.cookie="wait=answer";
    fetch("/submit", {
        method: "POST",
        body: JSON.stringify({guess: id}),
        headers:{
            "Content-Type": "application/json"
        }
    }).then(res=>res.json())
        .then((data) => {
            console.log(data);
            document.cookie="points="+data.points;
            window.open("/wait", "_self")

        })
}
