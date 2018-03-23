var ws = new WebSocket("ws://10.38.164.214:9999/connws/");

ws.onopen = () => {
    user = prompt('Username');
    document.querySelector('form[name="message"] input').focus();
    console.log('Connexion établie');
    document.querySelector('form[name="message"]').onsubmit = (e) => {
        var data = {
            type: "message",
            nickname: user,
            content: document.querySelector('form[name=message] input').value
        }
        ws.send(JSON.stringify(data));
        e.target.reset();
        return false;
    }
}

ws.onmessage = (e) => {
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
    }
}

ws.onerror = (e) => {
    console.log('Erreur');
    console.log(e);
}

ws.onclose = (e) => {
    console.log('Connexion fermée');
    delete ws;
}