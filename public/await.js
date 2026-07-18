console.log(window.location.host)

function sendAwait(state, callback) {
    document.cookie="state="+state;

    const socket = new WebSocket("ws://"+window.location.host+":8080/?key="+state);

    socket.onmessage = event => {
        callback(event.data);
    }
}