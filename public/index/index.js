
function submit() {
    const input = document.getElementById("namefield");

    const value = input.value;

    fetch("/register", {
        method: "POST",
        body: JSON.stringify({"name":value}),
        headers:{
            "Content-Type": "application/json"
        }
    }).then((response) => {
        switch (response.status) {
            case 200: {
                document.cookie = "name=" + value;
                document.cookie ="wait=start";
                window.open("/wait", "_self");
                break;
            }
            case 400: {
                alert("Someone already has that name");
                return;
            }
            case 401:{
                return;
            }
            case 402:{
                alert("Too many users")
            }
        }
    })
}