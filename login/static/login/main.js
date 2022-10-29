const form = document.querySelector('form');
const warn = text => {
    alert(text);
    form.querySelector('button').disabled = false;
}
form.addEventListener('submit', async e => {
    e.preventDefault();
    form.querySelector('button').disabled = true;
    const id = form.querySelector('#id');
    const pw = form.querySelector('#pw');
    if (!id.value || !pw.value) return warn('빈값이 있습니다');
    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: id.value, pw: pw.value }),
    });
    const json = await res.json();
    if (json.err) return warn(json.err);
    if (this.cookieStore) await cookieStore.set('hash', json.hash);
    else localStorage.hash = json.hash;
    location.replace('/'+location.search.slice(1));
});

document.querySelector('a').href += location.search;