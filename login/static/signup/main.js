const form = document.querySelector('form');
const warn = text => {
    alert(text);
    form.querySelector('button').disabled = false;
}
form.addEventListener('submit', async e => {
    e.preventDefault();
    form.querySelector('button').disabled = true;
    const id = form.querySelector('#id');
    const name = form.querySelector('#username');
    const pw = form.querySelector('#pw');
    if (!id.value || !name.value || !pw.value) return warn('빈값이 있습니다');
    if (id.value.replace(/[a-z0-9]/gi, '')) return warn('아이디는 a-z, A-Z, 0-9 글자만 이용 가능합니다');
    if (id.value.length < 6 || pw.value.length < 4) return warn('아이디는 6자 이상, 비밀번호는 4자 이상만 가능합니다');
    if (id.value.length > 20 || pw.value.length > 20 || name.value.length > 20) return warn('아이디, 비밀번호, 닉네임은 20자 이하만 가능합니다');
    if (!id.value.match(/[a-z]/i)) return warn('아이디는 숫자로만 이루어질수 없습니다');
    if (name.value.includes('<') || name.value.includes('>')) return warn('이름엔 태그를 넣을수 없습니다.');
    if (name.value.includes('\n')) return warn('이름엔 줄바꿈을 넣을수 없습니다.');
    const res = await fetch('/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: id.value, name: name.value, pw: pw.value }),
    });
    const json = await res.json();
    if (json.err) return warn(json.err);
    if (this.cookieStore) await cookieStore.set('hash', json.hash);
    else localStorage.hash = json.hash;
    location.pathname = location.search.slice(1);
});

document.querySelector('a').href += location.search;

const socket = io();
fetch('//api.ipify.org').then(res=>res.text())
.then(_ip => socket.emit('checkip', ip=_ip))
socket.on('ban', () => location.replace('//google.com'));
if (localStorage.banned) location.replace('//google.com');