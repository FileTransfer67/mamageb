

sendAwait("podium", (data)=>{
    if (data==="next"){
        document.cookie="guess=null; guessID=-1; points=0;"
        window.open("/start", "_self");
    } else if (data==="podium"){
        document.cookie="guess=null; guessID=-1; points=0;"
        window.open("/podium", "_self");
    }
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
    let i = 0;
    for (let c of out){
        let cl="";
        if (c.name===yourname){cl="you"}
        if (i==0){cl="gold"};
        if (i==1){cl="silver"};
        if (i==2){cl="bronze"}
        inner+="\n" +
            "    <div class=\"b name "+cl+"\"><div style=\"break-inside: avoid\">"+
            (c.name===yourname?"<u>"+c.name+"</u>":c.name)
            +"</div><div></div><div>"+c.points+"pts</div></div>"
        i++;
    }
    leaderboard.innerHTML = inner;
    console.log(out);
})