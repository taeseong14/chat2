(async () => {
    const user = location.pathname.split('/').pop() || localStorage.hash;
    const res = await fetch('/user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: user && JSON.stringify({ user }),
    });
    const json = await res.json();
    if (json.err) return alert('해당 유저를 찾을수 없습니다');
    document.querySelector('#container').hidden = false;
    if (json.prof) document.querySelector('img').src = json.prof;
    document.querySelector('#id span').innerText = '#' + json.id;
    document.querySelector('#name span').innerText = json.name;
    if (json.isMine) {
        document.querySelectorAll('[hidden]').forEach(e=>e.hidden=false);
        document.querySelector('input[type=file]').addEventListener('change', async e => {
            const file = e.target.files[0];
            const buffer = await file.arrayBuffer();
            console.log(buffer);
            fetch('/changeProf', {
                method: 'POST',
                headers: { 'content-type': '' }
                body: JSON.stringify({ buffer }),
            })
        })
    }
})();