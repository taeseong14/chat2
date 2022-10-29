const header = document.querySelector('header #status');

(async () => {
    const hash = await cookieStore.get('hash') || localStorage.hash;
    if (!hash) return header.innerHTML = '<a href="/login">로그인</a>';

    const res = await fetch('/user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hash: hash.value })
    });
    const json = await res.json();
    if (json.err) return alert(json.err);
    header.innerHTML = json.name + '님 환영하빈다';
    document.querySelector('.logout').hidden = false;
})();

const logout = document.querySelector('.logout');

logout.addEventListener('click', async () => {
    await cookieStore.delete('hash');
    alert('로그아웃 되었습니다.');
    location.reload();
})
