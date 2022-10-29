(function () {
    
    const username = document.querySelector('#username');
    const profileImg = document.querySelector('#profile-img');
    const profileInfo = document.querySelector('#info');
    const loginText = document.querySelector('#login');
    const myprofile = document.querySelector('#myprofile');
    
    document.body.classList.add(navigator.userAgent.match(/Window/i)?'window':'mobile');
    
    const socket = io();
    delete io;
    let ip;
    if (localStorage.banned || localStorage.a_login || sessionStorage.ban) {
        delete io;
        throw location.replace('//google.com');
    }
    if (this.cookieStore) cookieStore.get('ban').then(e=>{if(e)location.replace('//google.com')});
    fetch('//api.ipify.org').then(res=>res.text())
    .then(_ip => socket.emit('checkip', ip=_ip))
    .catch(() => {
        document.body.innerHTML = '';
        alert('아이피못구함ㅉㅈ');
        alert('아이피내니뮤ㅠㅠ');
        location.reload();
    });
    socket.on('ban', async () => {
        localStorage.banned = localStorage.a_login = sessionStorage.ban = true;
        document.body.innerHTML = '';
        if (this.cookieStore) await cookieStore.set('ban', 'sans');
        alert('잘가~여~');
        throw location.replace('//google.com');
    });
    
    let name, myId, prof;
    let loading = true;
    
    (async () => {
        const hash = (await this?.cookieStore?.get('hash'))?.value || localStorage.hash;
        if (!hash) {
            profileInfo.style.opacity = '1';
            loginText.innerHTML = '<a href="/login?chat">로그인</a>';
            document.querySelector('form button').disabled = true;
            loading = false;
            return;
        }
        const res = await fetch('/user', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ user: hash }),
        });
        const json = await res.json();
        if (json.err) return alert(json.err);
        name = json.name; myId = json.id; prof = json.prof;
        username.innerHTML = name;
        if (!prof) prof = './files/img/default-profile.png';
        profileImg.src = prof;
        profileImg.hidden = false;
        myprofile.hidden = false;
        loading = false;
        socket.emit('setId', myId, name);
        socket.emit('getLog');
        socket.on('getLog', logs => {
            logs.forEach(log => {
                if (log.type == 'message') addChat(log);
                else enterPerson(log);
            });
            enterPerson({ id: myId, name });
        });
        socket.emit('enter', { id: myId, name });
        setOnline(online);
    })(); // login info
    
    const chatView = document.querySelector('#chat-view');
    
    let lastPerson;
    
    function addChat({ msg, sender, prof, id }) {
        const container = document.createElement('div');
        container.classList.add('chat');
        const chat = document.createElement('div');
        chat.classList.add('chat-content');
        if (id === myId) container.classList.add('mine');
        else {
            container.setAttribute('user-id', id);
            if (lastPerson !== id) {
                const profile = document.createElement('div');
                profile.classList.add('profile');
                const profileImg = document.createElement('img');
                profileImg.src = prof;
                profileImg.addEventListener('click', e => open('./profile/' + e.target.parentElement.parentElement.getAttribute('user-id')))
                profile.appendChild(profileImg);
                container.appendChild(profile);
                const chatSender = document.createElement('span');
                chatSender.classList.add('chat-sender');
                chatSender.innerText = sender;
                chat.appendChild(chatSender);
            } else container.classList.add('same-person');
        }
        const chatMsg = document.createElement('div');
        chatMsg.classList.add('chat-msg');
        chatMsg.innerText = msg;
        chat.appendChild(chatMsg);
        container.appendChild(chat);
        chatView.appendChild(container);
        chatView.scrollTop = chatView.scrollHeight;
        lastPerson = id;
    }
    
    socket.on('message', addChat);
    
    const form = document.querySelector('#chat-form');
    const chatInput = form.querySelector('#chat-input');
    const inputBtn = form.querySelector('#chat-btn');
    const onFormSubmit = e => {
        e && e.preventDefault();
        if (loading) return;
        if (!name) return location.replace('/login?chat');
        if (!chatInput.value.trim()) return;
        if (inputBtn.disabled) return;
        inputBtn.disabled = true;
        setTimeout(() => inputBtn.disabled = false, 500);
        chatInput.value = chatInput.value.slice(0, 1000);
        socket.emit('message', { msg: chatInput.value, sender: name, id: myId, prof, ip });
        addChat({ msg: chatInput.value, sender: '나', id: myId, prof, mine: true });
        chatInput.value = '';
    }
    form.addEventListener('submit', onFormSubmit);
    chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onFormSubmit();
        }
    });
    
    let online = [];
    function setOnline(arr) {
        online = [...new Set(arr.filter(e=>e.id !== myId))];
        const onlineContainer = document.querySelector('#online ul');
        onlineContainer.innerHTML = '';
        online.forEach(e => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = './profile/' + e.id;
            a.innerText = e.name;
            a.target = '_blank';
            li.appendChild(a);
            onlineContainer.appendChild(li);
        });
    }
    socket.on('setOnline', setOnline);
    
    socket.on('enter', ({ id, name, exit }) => {
        if (exit) return enterPerson({ id, name, exit });
        if (!online.find(e=>e.id==id) && id !== myId) 
        enterPerson({ id, name });
    });
    function enterPerson({ id, name, exit }) {
        lastPerson = undefined;
        const container = document.createElement('div');
        container.classList.add('enter');
        const span = document.createElement('span');
        if (exit) span.innerHTML = (id === myId? '' : `<a href="./profile/${id}" target="_blank">${name}</a>님이 `) + '퇴장했어요.';
        else span.innerHTML = (id === myId ? '' : `<a href="./profile/${id}" target="_blank">${name}</a>님이 `) + '입장했어요.';
        container.appendChild(span);
        chatView.appendChild(container);
        chatView.scrollTop = chatView.scrollHeight;
    }
    
    socket.on('warn', console.log); //이상한짓
    
    socket.on('disconnect', () => {
        document.title = 'Reloading...';
        setTimeout(()=>location.reload(), 1000);
    });
    
})()