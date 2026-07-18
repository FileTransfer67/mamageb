const title = document.getElementById("title");
const buttons = document.getElementsByClassName("quizbutton");
const result = document.getElementById("result");

sendAwait("leaderboard", (data)=>{
    if (data==="next"){
        document.cookie="guess=null; guessID=-1; points=0;"
        window.open("/quiz", "_self");
    } else if (data==="podium"){
        document.cookie="guess=null; guessID=-1; points=0;"
        window.open("/podium", "_self");
    }
})
fetch("/getQuestion").then(response => response.json()).then((data) => {
    console.log(data);
    title.innerText = data.text;
    let guess = getCookie("guessID")
    let correct = true;

    for (let i = 0; i<4; i++){
        buttons[i].innerHTML = data.answers[i];
        if (i===data.correctAnswer){
            buttons[i].classList.add("correct");
        } else if (i==guess){
            buttons[i].classList.add("incorrect");
            correct=false;
        }
    }
    console.log(guess)
    let text="You're wrong!";
    if (correct){text="Correct Answer!"}
    if (guess==-1){text="You didn't guess."}
    result.innerText = text+" You reveice "+getCookie("points")+" points";
})
const leaderboard = document.getElementById("leaderboard");

fetch("/getLeaderboard").then(response => response.json()).then((data) => {
    console.log(data);
    out = [];
    let yourname = getCookie("name");
    for (let name of Object.keys(data)){
        out.push({"name":name, "points":data[name].points});
    }
    console.log(out);
    out.sort((a,b) => {
        return b["points"]-a["points"];
    });
    let inner = "";
    for (let c of out){
        inner+="\n" +
            "    <div class=\"b name "+(c.name===yourname?"you":"")+"\"><div style=\"break-inside: avoid\">"+
            (c.name===yourname?"<u>"+c.name+"</u>":c.name)
            +"</div><div></div><div>"+c.points+"pts</div></div>"
    }
    leaderboard.innerHTML = inner;
    console.log(out);
})