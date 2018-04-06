var ws = new WebSocket("ws://10.38.163.155:9999/connws/");

window.onload = () => {
    init();
}

ws.onopen = () => {
    user = prompt('Username');
    document.querySelector('form[name="message"] input').focus();
    console.log('Connexion établie');

    document.querySelector('form[name="message"]').onsubmit = e => {
        var data = {
            type: "message",
            nickname: user,
            content: document.querySelector('form[name=message] input').value
        }
        ws.send(JSON.stringify(data));
        e.target.reset();
        return false;
    }

    document.querySelector('form[name="pseudo"]').onsubmit = e => {
        var newName = document.querySelector('form[name=pseudo] input').value
        var data = {
            type: "pseudo",
            nickname: user,
            content: `${user} renamed to ${newName}`
        }
        ws.send(JSON.stringify(data));
        e.target.reset();
        user = newName;
        return false;
    }
}

ws.onmessage = e => {
    console.log('Message reçu');
    received = JSON.parse(e.data);
    regexp = /http.+\.gif/g;
    found = received.content.match(regexp)
    received.content = received.content.split(' ');
    for (var i in received.content) {
        if (received.content[i].match(regexp)) {
            received.content[i] = `<br><img src="${received.content[i]}"><br>`;
        }
    }
    if (received.type == 'message') {
        document.querySelector('.messages').innerHTML += received.nickname + ' said : ';
        for (var i in received.content) {
            document.querySelector('.messages').innerHTML += received.content[i] + ' ';
        }
        document.querySelector('.messages').innerHTML += '<br>';
    } else if (received.type == 'pseudo') {
        for (var i in received.content) {
            document.querySelector('.messages').innerHTML += received.content[i] + ' ';
        }
        document.querySelector('.messages').innerHTML += '<br>';
    } else if (received.type == 'draw') {
        ctx.fillRect(received.currX,received.currY,1,1);
    }
}

ws.onerror = e => {
    console.log('Erreur');
    console.log(e);
}

ws.onclose = e => {
    console.log('Connexion fermée');
    delete ws;
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
        console.log('UP');
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            var data = {
                type: "draw",
                "currX": currX,
                "currY": currY
            }
            ws.send(JSON.stringify(data));
            draw();
        }
    }
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function init() {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

var canvas, ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

var x = "black",
    y = 2;