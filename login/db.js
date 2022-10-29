const sqlite3 = require('sqlite3').verbose();
const Log = (err, row) => {
    err && console.log(err);
    // row && row.forEach(e => console.log(e));
};


class DB {
    #db;

    constructor(path) {
        this.#db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE, Log)
        this.#db.run(`CREATE TABLE IF NOT EXISTS USER (
            hash  text not null,
            id    text not null,
            name  text not null,
            prof  text
        )`);
        this.getAll().then(e=>this.ids = e.map(e=>e.id));
    }

    insert(hash, id, name) {
        return new Promise((resolve, reject) => {
            this.#db.run(`INSERT INTO USER (hash, id, name) values(?, ?, ?)`, [hash, id, name], err => {
                err ? reject(err) : resolve();
            });
        });
    }

    getByHash(hash) {
        return new Promise((resolve, reject) => {
            this.#db.get(`SELECT * FROM USER WHERE hash = ?`, hash, (err, row) => {
                err ? reject(err) : resolve(row);
            });
        });
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            this.#db.get(`SELECT * FROM USER WHERE id = ?`, id, (err, row) => {
                err ? reject(err) : resolve(row);
            });
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.#db.all(`SELECT * FROM USER`, (err, row) => {
                err ? reject(err) : resolve(row);
            });
        });
    }

    changeProfByHash(hash, link) {
        return new Promise((resolve, reject) => {
            this.#db.run(`UPDATE USER SET prof = ? WHERE hash = ?`, [link, hash], (err, row) => {
                err ? reject(err) : resolve();
            });
        });
    }

    changeNameById(id, name) {
        return new Promise((resolve, reject) => {
            this.#db.run(`UPDATE USER SET name = ? WHERE id = ?`, [name, id], (err, row) => {
                err ? reject(err) : resolve();
            });
        });
    }

    deleteUserByHash(hash) {
        return new Promise((resolve, reject) => {
            this.#db.run(`DELETE FROM USER WHERE hash = ?`, [hash], err => {
                err ? reject(err) : resolve();
            });
        });
    }
}

module.exports = new DB('login/users.db');
const db = new DB('login/users.db');
// db.getAll().then(console.log);
// db.deleteUserByHash('6276d5c5865b7fa002f10e53e842f0b2');
// db.deleteUserByHash('38690393debab8106cd0262a612fb913');
// db.insert()