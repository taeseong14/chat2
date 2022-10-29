const app = require('express')();

app.use(require('./apis'));
app.use('/chat', require('./chat'));
app.get('/re', (req, res) => res.redirect(Object.keys(req.query)[0]));
app.use(require('./login'));

// app.listen(3000, () => console.log('listening on port 3000'));
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const db = require('./login/db');
let ids = [];
db.getAll().then(e => ids = e.map(e=>e.id));

const disabled = {};

const banned_ips = ['121.140.51.238', '123.219.171.4',
'219.100.37.237', '218.52.230.134', '175.125.140.207',
'175.212.16.147','211.245.116.138'];

const fs = require('fs');

const logs = JSON.parse(fs.readFileSync('./chat/log.json'));
let online = [];


io.on('connection', socket => {
    socket.join('welcome'); // 기본
    socket.on('message', async ({ msg, sender, prof, id, ip }) => {
        if (!sender || !msg || !id || !ip) return;
        if (ip.replace(/[\d\.]/g, '')) return;
        if (ip.split('.').length<3) return;
        if (!ids.includes(id)) {
            const users = await db.getAll();
            ids = users.map(e => e.id);
            if (!ids.includes(id)) return socket.emit('warn', '어허 아이디 똑바로 넣으슈');
        }
        msg = msg.trim().slice(0, 1000);
        if (sender.includes('<') || sender.includes('\n')) return socket.emit('warn', '머하시는거시죠..?')
        sender = sender.trim().slice(0, 20);
        if (disabled[sender]) return socket.emit('warn', '채팅이 너무 빨라요.\n언제든지 밴할수 있답니다?');
        disabled[sender] = true;
        setTimeout(() => delete disabled[sender], 300);
        console.log('on message,', sender, msg, ip);
        socket.to('welcome').emit('message', { msg, sender, prof, id });
        logs.push({ type: 'message', msg, id, sender, prof });
        if (logs.length > 100) logs.splice(0, 1);
        if (msg === '/바풀봇') {
            const obj = { msg: '안녕반갑다', sender: '바풀봇', id: 'babpoolbot', prof: './files/img/sans.jpg' };
            socket.to('welcome').emit('message', obj);
            socket.emit('message', obj);
        }
        fs.writeFile('./chat/log.json', JSON.stringify(logs), () => {});
    });
    socket.on('enter', ({ id, name }) => {
        if ([...online].find(e=>e.id==id)) return;
        console.log('enter!', id, name);
        socket.to('welcome').emit('enter', { id, name });
        logs.push({ type: 'enter', id, name });
        online.push({ id, name });
        socket.to('welcome').emit('setOnline', [...online]);
        socket.emit('setOnline', [...online]);
    });
    socket.on('getLog', () => socket.emit('getLog', logs));
    socket.on('setId', (id, name) => { if (!socket._id) { socket._id = id; socket._name = name; } });
    socket.on('disconnect', () => {
        if (!socket._id) return;
        console.log('exit', socket._id, socket._name, socket.ip);
        socket.to('welcome').emit('enter', { id: socket._id, name: socket._name, exit: true });
        logs.push({ type: 'enter', id: socket._id, name: socket._name, exit: true });
        online.splice(online.findIndex(e=>e.id==socket._id), 1);
        socket.to('welcome').emit('setOnline', online);
    });
    socket.on('checkip', ip => {
        socket.ip = ip;
        if (banned_ips.includes(ip)) socket.emit('ban');
    })
});

server.listen(3000, () => console.log('3000'));