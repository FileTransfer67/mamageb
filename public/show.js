let time=0;
let guesses=null;
let dataSave;

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
    })
}
fetchQuestion();
function guess(id){
    
}
