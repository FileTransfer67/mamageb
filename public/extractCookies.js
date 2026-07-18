function getCookie(key){
    const cookies = document.cookie.split(";");
    for (let i = 0; i<cookies.length; i++){
        let item = cookies[i].trim().split("=");
        if (item[0]===key){
            return item[1];
        }
    }
    return null;
}