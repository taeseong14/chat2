const express = require('express');
const app = express.Router();
const crypto = require('crypto');
const db = require('./db');

app.use(express.json());
app.use(require('cookie-parser')())
app.use(express.static(__dirname + '/static'));

const users = {};

app.post('/login', async (req, res) => {
    const { id, pw } = req.body;
    const hash = crypto.createHash('md5').update(`${id}-${pw}`).digest('hex');
    const row = await db.getByHash(hash);
    if (row) console.log(id,'님로그인존겨유'), res.send({ hash });
    else res.send({ err: '아이디 또는 비밀번호가 틀렸습니다.' });
});

app.post('/register', async (req, res) => {
    const { id, pw, name } = req.body;
    if (!id || !pw || !name) return res.send({ err: 'value is null' });
    if (id.replace(/[a-z0-9]/gi, '')) return res.send({ err: '아이디는 a-z, 0-9 글자만 이용 가능합니다' });
    if (id.length < 6 || pw.length < 4) return res.send({ err: '아이디는 6자 이상, 비밀번호는 4자 이상으로 작성 부탁드립니다' });
    if (id.length > 20 || pw.length > 20 || name.length > 20) return res.send({ err: '아이디, 비밀번호, 닉네임은 20자 이하만 가능합니다' });
    if (!id.match(/[a-z]/i)) return res.send({ err: '아이디는 숫자로만 이루어질수 없습니다' });
    if (name.includes('<') || name.includes('>')) return res.send({ err: '이름엔 태그를 넣을수 없습니다.' });
    if (name.includes('\n')) return res.send({ err: '이름엔 줄바꿈을 넣을수 없습니다.' });
    const row = await db.getById(id);
    if (row) return res.send({ err: 'id already used' });
    console.log(id,'님회원가입존겨유');
    const hash = crypto.createHash('md5').update(`${id}-${pw}`).digest('hex');
    await db.insert(hash, id, name);
    res.send({ hash });
});

app.post('/user', async (req, res) => {
    const user = req.body.user || req.cookies.hash;
    const value = await db.getByHash(user) || await db.getById(user);
    if (value) {
        if (req.cookies.hash === value.hash) value.isMine = true;
        else delete value.hash;
    }
    res.send(value || { err: '로그인하생ㅉㅈ' });
});


app.get('/logout', (req, res) => {
    res.send(`<script>
    if (this.cookieStore) cookieStore.delete('hash').then(()=>location.replace('/'+location.search.slice(1)));
    else {
        delete localStorage.hash;
        location.replace('/'+location.search.slice(1));
    } </script>`);
});

app.post('/changeProf', async (req, res) => {
    // const hash = req.cookies.hash;
    // const { link } = req.body;
    // if (!hash || !link) res.send({ err: '빈값있' });
    // await db.changeProfByHash(hash, link);
    // res.send({ result: link });
    console.log(req.body);
});

module.exports = app;